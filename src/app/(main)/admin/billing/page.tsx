import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const adminDb = getFirestore();

export default async function AdminBilling() {
  const users = await adminDb.collection("users").get()

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Billing Admin</h1>
      <div className="space-y-4">
      {users.docs.map(doc => {
        const u = doc.data()
        return (
          <div key={doc.id} className="border p-4 rounded-lg">
            <strong className="font-mono text-sm">{doc.id}</strong>
            <p>Email: {u.email}</p>
            <p>Plan: {u.role}</p>
            <p>Status: {u.subscription?.status || 'N/A'}</p>
            <form action={`/api/admin/upgrade`} method="POST" className="mt-2 flex gap-2 items-center">
              <input type="hidden" name="uid" value={doc.id} />
              <select name="plan" defaultValue={u.role} className="border rounded px-2 py-1 text-sm">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
              <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90">Change Plan</button>
            </form>
          </div>
        )
      })}
      </div>
    </div>
  )
}
