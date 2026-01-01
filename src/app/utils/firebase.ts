import admin from 'firebase-admin';
import config from '../config';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase_project_id,
      privateKey: config.firebase_private_key,
      clientEmail: config.firebase_client_email,
    } as admin.ServiceAccount),
  });
}

const firebaseAdmin = admin;

export default firebaseAdmin;
