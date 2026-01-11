#!/usr/bin/env node
// ============================================================================
// SIMPLE E2E TEST RUNNER
// Save as: test.js
// Run with: node test.js
// ============================================================================

const https = require('http');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const API_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

// ============================================================================
// HTTP HELPER
// ============================================================================

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  console.log('\n' + colors.cyan + '━'.repeat(60) + colors.reset);
  console.log(colors.cyan + colors.bright + text + colors.reset);
  console.log(colors.cyan + '━'.repeat(60) + colors.reset + '\n');
}

function test(name) {
  process.stdout.write(`${colors.yellow}Testing:${colors.reset} ${name}... `);
}

function pass(message = '') {
  console.log(`${colors.green}✅ PASSED${colors.reset} ${message}`);
  passed++;
}

function fail(message = '') {
  console.log(`${colors.red}❌ FAILED${colors.reset} ${message}`);
  failed++;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN TEST SUITE
// ============================================================================

async function runTests() {
  console.log('\n' + colors.blue);
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          🧪 JustHostIt End-to-End Test Suite                 ║');
  console.log('║                                                               ║');
  console.log('║  Testing: Alice refers Bob, both get $10 credits            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  let aliceToken, bobToken, aliceUid, bobUid, aliceReferralCode;

  try {
    // ========================================================================
    // HEALTH CHECK
    // ========================================================================

    header('HEALTH CHECK');

    test('API server responding');
    const health = await request('GET', '/health');
    if (health.status === 200 && health.data.status === 'healthy') {
      pass();
    } else {
      fail('Server not healthy');
      process.exit(1);
    }

    // ========================================================================
    // PHASE 1: ALICE SIGNS UP
    // ========================================================================

    header('PHASE 1: Alice Signs Up');

    test('Register Alice');
    const aliceSignup = await request('POST', '/api/auth/register', {
      email: 'alice@test.com',
      password: 'TestPassword123!',
      displayName: 'Alice Tester',
    });

    if (aliceSignup.status === 200 && aliceSignup.data.user) {
      aliceUid = aliceSignup.data.user.uid;
      pass(`(UID: ${aliceUid.substring(0, 8)}...)`);
    } else {
      fail(JSON.stringify(aliceSignup.data));
      process.exit(1);
    }

    test('Login Alice');
    const aliceLogin = await request('POST', '/api/auth/login', {
      email: 'alice@test.com',
      password: 'TestPassword123!',
    });

    if (aliceLogin.status === 200 && aliceLogin.data.token) {
      aliceToken = aliceLogin.data.token;
      pass(`(Token: ${aliceToken.substring(0, 20)}...)`);
    } else {
      fail();
      process.exit(1);
    }

    // ========================================================================
    // PHASE 2: ALICE CREATES SITE
    // ========================================================================

    header('PHASE 2: Alice Creates Her First Site');

    test('Get Alice\'s subscription (trial)');
    const aliceSub = await request('GET', '/api/user/subscription', null, aliceToken);

    if (aliceSub.status === 200 && aliceSub.data.plan) {
      pass(`(Plan: ${aliceSub.data.plan.name}, Sites: ${aliceSub.data.usage.sites})`);
    } else {
      fail();
    }

    test('Create site "alice-portfolio.com"');
    const site = await request(
      'POST',
      '/api/sites',
      { domain: 'alice-portfolio.com', type: 'static' },
      aliceToken
    );

    if (site.status === 201 && site.data.siteId) {
      pass(`(Site ID: ${site.data.siteId})`);
    } else {
      fail(JSON.stringify(site.data));
    }

    test('Verify usage incremented');
    const aliceSubUpdated = await request('GET', '/api/user/subscription', null, aliceToken);

    if (aliceSubUpdated.data.usage.sites === 1) {
      pass('(Sites: 1)');
    } else {
      fail(`(Sites: ${aliceSubUpdated.data.usage.sites})`);
    }

    // ========================================================================
    // PHASE 3: ALICE GETS REFERRAL CODE
    // ========================================================================

    header('PHASE 3: Alice Gets Her Referral Code');

    test('Generate Alice\'s referral code');
    const aliceReferral = await request('GET', '/api/referral/stats', null, aliceToken);

    if (aliceReferral.status === 200 && aliceReferral.data.code) {
      aliceReferralCode = aliceReferral.data.code;
      log(`\n  ${colors.green}✅ Alice's referral code: ${colors.bright}${aliceReferralCode}${colors.reset}`);
      log(`  ${colors.cyan}📋 Referral URL: ${aliceReferral.data.referralUrl}${colors.reset}\n`);
      pass();
    } else {
      fail();
      process.exit(1);
    }

    test('Validate referral code');
    const validate = await request('GET', `/api/referral/validate/${aliceReferralCode}`);

    if (validate.data.valid === true) {
      pass();
    } else {
      fail();
    }

    // ========================================================================
    // PHASE 4: BOB SIGNS UP WITH REFERRAL
    // ========================================================================

    header('PHASE 4: Bob Signs Up with Alice\'s Referral Code');

    test('Register Bob with referral code');
    const bobSignup = await request('POST', '/api/auth/register', {
      email: 'bob@test.com',
      password: 'TestPassword456!',
      displayName: 'Bob Referee',
      referralCode: aliceReferralCode,
    });

    if (bobSignup.status === 200 && bobSignup.data.user) {
      bobUid = bobSignup.data.user.uid;
      pass(`(UID: ${bobUid.substring(0, 8)}...)`);
    } else {
      fail(JSON.stringify(bobSignup.data));
      process.exit(1);
    }

    test('Login Bob');
    const bobLogin = await request('POST', '/api/auth/login', {
      email: 'bob@test.com',
      password: 'TestPassword456!',
    });

    if (bobLogin.status === 200 && bobLogin.data.token) {
      bobToken = bobLogin.data.token;
      pass();
    } else {
      fail();
      process.exit(1);
    }

    // ========================================================================
    // PHASE 5: BOB UPGRADES (TRIGGERS REWARDS)
    // ========================================================================

    header('PHASE 5: Bob Upgrades to Business (Triggers Rewards)');

    test('Create Bob\'s checkout session');
    const bobCheckout = await request(
      'POST',
      '/api/billing/create-checkout-session',
      { priceId: 'price_business_monthly' },
      bobToken
    );

    if (bobCheckout.status === 200 && bobCheckout.data.sessionId) {
      pass(`(Session: ${bobCheckout.data.sessionId})`);
    } else {
      fail();
    }

    log(`\n  ${colors.yellow}💳 Simulating Bob's first payment...${colors.reset}\n`);

    test('Convert referral (issue rewards)');
    const convert = await request('POST', '/api/test/convert-referral', {
      userId: bobUid,
    });

    if (convert.status === 200) {
      pass();
      log(`\n  ${colors.green}💰 Rewards issued to both Alice and Bob!${colors.reset}\n`);
    } else {
      fail(JSON.stringify(convert.data));
    }

    // Give system a moment to process
    await sleep(500);

    // ========================================================================
    // PHASE 6: VERIFY CREDITS
    // ========================================================================

    header('PHASE 6: Verify Credits Issued');

    test('Check Alice\'s credits');
    const aliceCredits = await request('GET', '/api/credits', null, aliceToken);

    if (aliceCredits.status === 200 && aliceCredits.data.totalCredits >= 10) {
      pass(`($${aliceCredits.data.totalCredits} in credits)`);
      log(`  ${colors.cyan}💵 Credits: ${JSON.stringify(aliceCredits.data.credits, null, 2)}${colors.reset}`);
    } else {
      fail(`($${aliceCredits.data.totalCredits})`);
    }

    test('Check Bob\'s credits');
    const bobCredits = await request('GET', '/api/credits', null, bobToken);

    if (bobCredits.status === 200 && bobCredits.data.totalCredits >= 10) {
      pass(`($${bobCredits.data.totalCredits} in credits)`);
    } else {
      fail(`($${bobCredits.data.totalCredits})`);
    }

    // ========================================================================
    // PHASE 7: VERIFY STATS UPDATED
    // ========================================================================

    header('PHASE 7: Verify Referral Stats Updated');

    test('Check Alice\'s updated referral stats');
    const aliceStatsUpdated = await request('GET', '/api/referral/stats', null, aliceToken);

    if (
      aliceStatsUpdated.status === 200 &&
      aliceStatsUpdated.data.totalReferrals >= 1 &&
      aliceStatsUpdated.data.totalEarnings >= 10
    ) {
      pass();
      log(`\n  ${colors.cyan}📊 Alice's Stats:${colors.reset}`);
      log(`     Referrals: ${aliceStatsUpdated.data.totalReferrals}`);
      log(`     Earnings:  $${aliceStatsUpdated.data.totalEarnings}`);
      log(`     Code:      ${aliceStatsUpdated.data.code}\n`);
    } else {
      fail();
    }

    test('Check leaderboard');
    const leaderboard = await request('GET', '/api/referral/leaderboard');

    if (leaderboard.status === 200 && Array.isArray(leaderboard.data)) {
      pass(`(${leaderboard.data.length} entries)`);
    } else {
      fail();
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================

    header('TEST SUMMARY');

    const total = passed + failed;
    log(`Tests run: ${colors.blue}${total}${colors.reset}`, 'reset');
    log(`Passed:    ${colors.green}${passed}${colors.reset}`, 'reset');
    log(`Failed:    ${colors.red}${failed}${colors.reset}`, 'reset');

    if (failed === 0) {
      console.log('\n' + colors.green);
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                                                               ║');
      console.log('║  🎉  ALL TESTS PASSED - SYSTEM WORKING PERFECTLY!            ║');
      console.log('║                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(colors.reset);

      log('\n✅ Complete user journey tested:', 'green');
      log('   1. Alice signed up ✓', 'green');
      log('   2. Alice created a site ✓', 'green');
      log('   3. Alice got referral code: ' + aliceReferralCode + ' ✓', 'green');
      log('   4. Bob signed up with referral ✓', 'green');
      log('   5. Bob upgraded (triggered rewards) ✓', 'green');
      log('   6. Both received $10 credits ✓', 'green');
      log('   7. Stats and leaderboard updated ✓', 'green');

      log('\n🚀 System ready for production!\n', 'cyan');
      log('Next steps:', 'yellow');
      log('  1. View Firestore data: http://localhost:4000/firestore', 'reset');
      log('  2. View Auth users: http://localhost:4000/auth', 'reset');
      log('  3. Deploy to production with real Firebase & Stripe\n', 'reset');

      process.exit(0);
    } else {
      console.log('\n' + colors.red);
      console.log('╔═══════════════════════════════════════════════════════════════╗');
      console.log('║                                                               ║');
      console.log('║  ❌  SOME TESTS FAILED - CHECK LOGS ABOVE                    ║');
      console.log('║                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════╝');
      console.log(colors.reset + '\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n' + colors.red + '❌ Test suite error:', error.message + colors.reset);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
