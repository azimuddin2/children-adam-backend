import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = path.join(process.cwd(), 'serviceAccountKey.json');

console.log('Service Account Path:', serviceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'children-of-adam',
  });

  console.log('Firebase admin initialized ✅');
}

export default admin;
