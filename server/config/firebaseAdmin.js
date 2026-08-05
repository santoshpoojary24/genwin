import admin from 'firebase-admin';

// Initialize Firebase Admin with project ID genwin-store-app
const projectId = process.env.FIREBASE_PROJECT_ID || 'genwin-store-app';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

export const firestoreAdmin = admin.firestore();
export const authAdmin = admin.auth();
export default admin;
