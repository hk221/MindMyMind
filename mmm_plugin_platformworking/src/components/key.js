const admin = require('firebase-admin');
const serviceAccount = require('./quizkey.json');

// This code initializes the Firebase Admin SDK using a service account key.
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});
