import { initializeApp } from "firebase/app";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);

export const uploadFile = async (file) => {
  const storageRef = ref(firebaseStorage, `uploads/${file.originalname}`);

  try {
    const uploadResult = await uploadBytes(storageRef, file.buffer);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (err) {
    console.error("Error uploading file to Firebase Storage:", err);
    throw err;
  }
};
