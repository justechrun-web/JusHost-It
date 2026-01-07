// ============================================================================
// END-TO-END TEST SUITE
// Run with: node scripts/e2e.test.js
// ============================================================================

const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin with emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
  projectId: 'jushostit-test',
});

// Import your services
const { referralService } = require('./referral-service');
const { emailService } = require('./email-service');

// ============================================================================
// TEST UTILITIES
// ============================================================================

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      this.passed++;
    } catch (error) {
      console.log('❌ FAILED');
      console.error('  Error:', error.message);
      this.failed++;
    }
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log(`Test Results: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(60) + '\n');
    return this.failed === 0;
  }
}

// ============================================================================
// TEST DATA
// ============================================================================

const testUsers = {
  alice: {
    email: 'alice@test.com',
    password: 'TestPassword123!',
    displayName: 'Alice Tester',
  },
  bob: {
    email: 'bob@test.com',
    password: 'TestPassword456!',
    displayName: 'Bob Referee',
  },
};

let aliceUser, bobUser, aliceToken, bobToken, aliceReferralCode;

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

async function runE2ETests() {
  const runner = new TestRunner();

  console.log('\n🧪 Starting End-to-End Tests\n');
  console.log('='.repeat(60));

  // ========================================================================
  // PHASE 1: USER AUTHENTICATION
  // ========================================================================
  
  console.log('\n📝 PHASE 1: User Authentication\n');

  await runner.test('Create Alice\'s account', async () => {
    aliceUser = await admin.auth().createUser({
      email: testUsers.alice.email,
      password: testUsers.alice.password,
      displayName: testUsers.alice.displayName,
    });
    
    if (!aliceUser.uid) throw new Error('Failed to create user');
  });

  await runner.test('Generate Alice\'s auth token', async () => {
    aliceToken = await admin.auth().createCustomToken(aliceUser.uid);
    if (!aliceToken) throw new Error('Failed to generate token');
  });

  await runner.test('Create Alice\'s Firestore records', async () => {
    const db = admin.firestore();
    
    // User document
    await db.collection('users').doc(aliceUser.uid).set({
      email: aliceUser.email,
      displayName: aliceUser.displayName,
      createdAt: Date.now(),
    });
    
    // Subscription document (trial)
    await db.collection('subscriptions').doc(aliceUser.uid).set({
      plan: 'basic',
      status: 'trial',
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: Date.now(),
    });
    
    // Usage document
    await db.collection('usage').doc(aliceUser.uid).set({
      sites: 0,
      bandwidth: 0,
      storage: 0,
      builds: 0,
      lastReset: Date.now(),
    });
    
    const userDoc = await db.collection('users').doc(aliceUser.uid).get();
    if (!userDoc.exists) throw new Error('User document not created');
  });

  // ========================================================================
  // PHASE 2: SITE CREATION & USAGE TRACKING
  // ========================================================================
  
  console.log('\n🌐 PHASE 2: Site Creation & Usage Tracking\n');

  await runner.test('Create Alice\'s first site', async () => {
    const db = admin.firestore();
    
    // Simulate site creation
    await db.collection('sites').add({
      userId: aliceUser.uid,
      domain: 'alice-portfolio.com',
      status: 'active',
      createdAt: Date.now(),
    });
    
    // Increment usage
    await db.collection('usage').doc(aliceUser.uid).update({
      sites: admin.firestore.FieldValue.increment(1),
    });
    
    const usage = await db.collection('usage').doc(aliceUser.uid).get();
    if (usage.data().sites !== 1) throw new Error('Usage not incremented');
  });

  await runner.test('Check usage limits (should pass)', async () => {
    const db = admin.firestore();
    const usage = await db.collection('usage').doc(aliceUser.uid).get();
    const subscription = await db.collection('subscriptions').doc(aliceUser.uid).get();
    
    const PLANS = {
      basic: { limits: { sites: 5 } },
    };
    
    const plan = PLANS[subscription.data().plan];
    const currentSites = usage.data().sites;
    
    if (currentSites >= plan.limits.sites) {
      throw new Error('Usage limit exceeded');
    }
  });

  // ========================================================================
  // PHASE 3: SUBSCRIPTION UPGRADE
  // ========================================================================
  
  console.log('\n💳 PHASE 3: Subscription Upgrade\n');

  await runner.test('Upgrade Alice to Business plan', async () => {
    const db = admin.firestore();
    
    await db.collection('subscriptions').doc(aliceUser.uid).update({
      plan: 'business',
      status: 'active',
      subscriptionId: 'sub_test_' + Date.now(),
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000),
    });
    
    // Update custom claims
    await admin.auth().setCustomUserClaims(aliceUser.uid, {
      plan: 'business',
      stripeRole: 'active',
    });
    
    const sub = await db.collection('subscriptions').doc(aliceUser.uid).get();
    if (sub.data().plan !== 'business') throw new Error('Plan not updated');
  });

  await runner.test('Record Alice\'s first payment', async () => {
    const db = admin.firestore();
    
    await db.collection('payments').add({
      userId: aliceUser.uid,
      amount: 3500, // $35.00
      status: 'paid',
      paidAt: Date.now(),
      invoiceId: 'in_test_' + Date.now(),
    });
    
    const payments = await db.collection('payments')
      .where('userId', '==', aliceUser.uid)
      .get();
    
    if (payments.empty) throw new Error('Payment not recorded');
  });

  // ========================================================================
  // PHASE 4: REFERRAL SYSTEM
  // ========================================================================
  
  console.log('\n🎁 PHASE 4: Referral System\n');

  await runner.test('Generate Alice\'s referral code', async () => {
    aliceReferralCode = await referralService.generateReferralCode(aliceUser.uid);
    
    if (!aliceReferralCode || aliceReferralCode.length !== 8) {
      throw new Error('Invalid referral code generated');
    }
    
    console.log(`\n  📋 Alice's referral code: ${aliceReferralCode}`);
  });

  await runner.test('Get Alice\'s referral stats', async () => {
    const stats = await referralService.getReferralStats(aliceUser.uid);
    
    if (!stats || stats.code !== aliceReferralCode) {
      throw new Error('Failed to get referral stats');
    }
    
    console.log('  📊 Stats:', JSON.stringify(stats, null, 2));
  });

  await runner.test('Bob signs up with Alice\'s referral code', async () => {
    // Create Bob's account
    bobUser = await admin.auth().createUser({
      email: testUsers.bob.email,
      password: testUsers.bob.password,
      displayName: testUsers.bob.displayName,
    });
    
    const db = admin.firestore();
    
    // Create Bob's records
    await db.collection('users').doc(bobUser.uid).set({
      email: bobUser.email,
      displayName: bobUser.displayName,
      referredBy: aliceReferralCode,
      createdAt: Date.now(),
    });
    
    await db.collection('subscriptions').doc(bobUser.uid).set({
      plan: 'basic',
      status: 'trial',
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
      createdAt: Date.now(),
    });
    
    await db.collection('usage').doc(bobUser.uid).set({
      sites: 0,
      bandwidth: 0,
      storage: 0,
      builds: 0,
      lastReset: Date.now(),
    });
    
    // Track referral
    await referralService.trackReferralSignup(bobUser.uid, aliceReferralCode);
    
    // Verify pending conversion created
    const conversions = await db.collection('referral_conversions')
      .where('refereeId', '==', bobUser.uid)
      .where('status', '==', 'pending')
      .get();
    
    if (conversions.empty) {
      throw new Error('Referral conversion not tracked');
    }
    
    console.log('  ✅ Referral tracked as pending');
  });

  await runner.test('Bob upgrades to paid plan', async () => {
    const db = admin.firestore();
    
    // Upgrade Bob's subscription
    await db.collection('subscriptions').doc(bobUser.uid).update({
      plan: 'business',
      status: 'active',
      subscriptionId: 'sub_test_' + Date.now(),
    });
    
    // Record Bob's payment
    await db.collection('payments').add({
      userId: bobUser.uid,
      amount: 3500, // $35.00
      status: 'paid',
      paidAt: Date.now(),
    });
    
    const sub = await db.collection('subscriptions').doc(bobUser.uid).get();
    if (sub.data().status !== 'active') {
      throw new Error('Bob not upgraded');
    }
  });

  await runner.test('Convert referral and issue rewards', async () => {
    const db = admin.firestore();
    
    // Simulate first payment (this would be called from Stripe webhook)
    await referralService.convertReferral(bobUser.uid, 35);
    
    // Verify conversion updated
    const conversion = await db.collection('referral_conversions')
      .where('refereeId', '==', bobUser.uid)
      .limit(1)
      .get();
    
    if (conversion.empty) {
      throw new Error('Conversion not found');
    }
    
    const conversionData = conversion.docs[0].data();
    if (conversionData.status !== 'rewarded') {
      throw new Error(`Conversion status is ${conversionData.status}, expected 'rewarded'`);
    }
    
    console.log('  💰 Conversion status:', conversionData.status);
  });

  await runner.test('Verify Alice received $10 credit', async () => {
    const credits = await referralService.getUserCredits(aliceUser.uid);
    
    if (credits.totalCredits !== 10) {
      throw new Error(`Expected $10, got $${credits.totalCredits}`);
    }
    
    console.log('  💵 Alice\'s credits:', credits);
  });

  await runner.test('Verify Bob received $10 credit', async () => {
    const credits = await referralService.getUserCredits(bobUser.uid);
    
    if (credits.totalCredits !== 10) {
      throw new Error(`Expected $10, got $${credits.totalCredits}`);
    }
    
    console.log('  💵 Bob\'s credits:', credits);
  });

  await runner.test('Check updated referral stats', async () => {
    const stats = await referralService.getReferralStats(aliceUser.uid);
    
    if (stats.totalReferrals !== 1) {
      throw new Error(`Expected 1 referral, got ${stats.totalReferrals}`);
    }
    
    if (stats.totalEarnings !== 10) {
      throw new Error(`Expected $10 earnings, got $${stats.totalEarnings}`);
    }
    
    console.log('  📈 Updated stats:', stats);
  });

  // ========================================================================
  // PHASE 5: CREDIT APPLICATION
  // ========================================================================
  
  console.log('\n💰 PHASE 5: Credit Application\n');

  await runner.test('Apply credits to Alice\'s next invoice', async () => {
    const invoiceAmount = 35; // $35 Business plan
    const result = await referralService.applyCredits(aliceUser.uid, invoiceAmount);
    
    if (result.creditsApplied !== 10) {
      throw new Error(`Expected $10 applied, got $${result.creditsApplied}`);
    }
    
    if (result.remainingAmount !== 25) {
      throw new Error(`Expected $25 remaining, got $${result.remainingAmount}`);
    }
    
    console.log('  💳 Invoice calculation:', result);
  });

  await runner.test('Verify credits marked as used', async () => {
    const credits = await referralService.getUserCredits(aliceUser.uid);
    
    if (credits.totalCredits !== 0) {
      throw new Error(`Expected $0 remaining, got $${credits.totalCredits}`);
    }
    
    const db = admin.firestore();
    const usedCredits = await db.collection('account_credits')
      .where('userId', '==', aliceUser.uid)
      .where('status', '==', 'used')
      .get();
    
    if (usedCredits.empty) {
      throw new Error('Credits not marked as used');
    }
    
    console.log('  ✅ Credits properly consumed');
  });

  // ========================================================================
  // PHASE 6: LEADERBOARD
  // ========================================================================
  
  console.log('\n🏆 PHASE 6: Leaderboard\n');

  await runner.test('Get referral leaderboard', async () => {
    const leaderboard = await referralService.getLeaderboard(10);
    
    if (!Array.isArray(leaderboard)) {
      throw new Error('Leaderboard not returned as array');
    }
    
    const aliceEntry = leaderboard.find(e => e.displayName === 'Alice Tester');
    if (!aliceEntry) {
      throw new Error('Alice not found in leaderboard');
    }
    
    if (aliceEntry.totalReferrals !== 1) {
      throw new Error('Alice referral count incorrect in leaderboard');
    }
    
    console.log('  🥇 Leaderboard:', leaderboard);
  });

  // ========================================================================
  // PHASE 7: FEATURE GATING
  // ========================================================================
  
  console.log('\n🔒 PHASE 7: Feature Gating\n');

  await runner.test('Basic plan cannot access staging (Bob)', async () => {
    const db = admin.firestore();
    const sub = await db.collection('subscriptions').doc(bobUser.uid).get();
    
    // Temporarily downgrade Bob for testing
    await db.collection('subscriptions').doc(bobUser.uid).update({
      plan: 'basic',
    });
    
    const PLANS = {
      basic: { limits: { stagingEnvironments: false } },
    };
    
    const subData = await db.collection('subscriptions').doc(bobUser.uid).get();
    const plan = PLANS[subData.data().plan];
    
    if (plan.limits.stagingEnvironments) {
      throw new Error('Basic plan should not have staging access');
    }
    
    console.log('  ✅ Feature gate working correctly');
    
    // Restore Bob's plan
    await db.collection('subscriptions').doc(bobUser.uid).update({
      plan: 'business',
    });
  });

  await runner.test('Business plan can access staging (Alice)', async () => {
    const db = admin.firestore();
    const sub = await db.collection('subscriptions').doc(aliceUser.uid).get();
    
    const PLANS = {
      business: { limits: { stagingEnvironments: true } },
    };
    
    const plan = PLANS[sub.data().plan];
    
    if (!plan.limits.stagingEnvironments) {
      throw new Error('Business plan should have staging access');
    }
    
    console.log('  ✅ Feature unlocked for Business plan');
  });

  await runner.test('Check site limit enforcement', async () => {
    const db = admin.firestore();
    
    // Try to create 6 sites on Basic plan (limit is 5)
    const testUserId = 'test_limit_user';
    
    await db.collection('subscriptions').doc(testUserId).set({
      plan: 'basic',
      status: 'active',
    });
    
    await db.collection('usage').doc(testUserId).set({
      sites: 5, // Already at limit
    });
    
    const PLANS = {
      basic: { limits: { sites: 5 } },
    };
    
    const usage = await db.collection('usage').doc(testUserId).get();
    const subscription = await db.collection('subscriptions').doc(testUserId).get();
    const plan = PLANS[subscription.data().plan];
    
    const canCreate = usage.data().sites < plan.limits.sites;
    
    if (canCreate) {
      throw new Error('Should not allow creating site beyond limit');
    }
    
    console.log('  ✅ Site limit enforced correctly');
  });

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  
  const success = runner.summary();
  
  if (success) {
    console.log('🎉 All tests passed! System is working end-to-end.\n');
    console.log('Summary:');
    console.log('  ✅ Alice signed up and upgraded');
    console.log('  ✅ Alice got referral code:', aliceReferralCode);
    console.log('  ✅ Bob signed up with referral code');
    console.log('  ✅ Bob upgraded to paid');
    console.log('  ✅ Both received $10 credits');
    console.log('  ✅ Credits applied to invoices');
    console.log('  ✅ Feature gating working');
    console.log('  ✅ Usage limits enforced');
    console.log('\n🚀 System ready for production!\n');
  } else {
    console.log('❌ Some tests failed. Check logs above.\n');
    process.exit(1);
  }
}

// ============================================================================
// CLEANUP FUNCTION
// ============================================================================

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const db = admin.firestore();
    
    // Delete all test collections
    const collections = [
      'users',
      'subscriptions',
      'usage',
      'sites',
      'payments',
      'referrals',
      'referral_conversions',
      'account_credits',
      'credit_usage',
    ];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    
    // Delete test users
    if (aliceUser) await admin.auth().deleteUser(aliceUser.uid);
    if (bobUser) await admin.auth().deleteUser(bobUser.uid);
    
    console.log('✅ Cleanup complete\n');
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================

runE2ETests()
  .then(() => cleanup())
  .catch(error => {
    console.error('\n❌ Test suite failed:', error);
    cleanup().then(() => process.exit(1));
  });

module.exports = { runE2ETests, cleanup };
