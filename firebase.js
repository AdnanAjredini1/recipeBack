import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { getStream , getStorage} from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyDr2EuGzkqMQiwdM-xLLlTmpl2MHr0eGQE",

  authDomain: "recipe-ebaa.firebaseapp.com",

  projectId: "recipe-ebaa",

  storageBucket: "recipe-ebaa.appspot.com",

  messagingSenderId: "679376901729",

  appId: "1:679376901729:web:0ac2cb0defbf55b0db3c20"

};

const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);




// Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// const firebaseConfig = {

//   apiKey: "AIzaSyDr2EuGzkqMQiwdM-xLLlTmpl2MHr0eGQE",

//   authDomain: "recipe-ebaa.firebaseapp.com",

//   projectId: "recipe-ebaa",

//   storageBucket: "recipe-ebaa.appspot.com",

//   messagingSenderId: "679376901729",

//   appId: "1:679376901729:web:0ac2cb0defbf55b0db3c20"

// };


// Initialize Firebase

// const app = initializeApp(firebaseConfig);



// Firebase user: adnanajredini144@gmail.com
// user password:recipeebaa123