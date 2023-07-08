const firebase = require('firebase/compat/app');
require('firebase/compat/storage');

const firebaseConfig = {
  apiKey: "AIzaSyCv9v-6mD13WUelUgzu9VYflfOiq5yU1FM",
  authDomain: "chadify-c49d8.firebaseapp.com",
  projectId: "chadify-c49d8",
  storageBucket: "chadify-c49d8.appspot.com",
  messagingSenderId: "263883592679",
  appId: "1:263883592679:web:abf0f1fa6a762c03b52342",
  measurementId: "G-T9WH5F5EXZ"
};

if (!firebase?.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}
module.exports = firebase;