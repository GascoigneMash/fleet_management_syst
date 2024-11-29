// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4_q0noG7gWYt7ayX-Ex32zKcfGRAKIOA",
  authDomain: "fleet-management-system-7708f.firebaseapp.com",
  projectId: "fleet-management-system-7708f",
  storageBucket: "fleet-management-system-7708f.firebasestorage.app",
  messagingSenderId: "407575454772",
  appId: "1:407575454772:web:fd9056c9729c2016ba5661"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// Wait for the DOM to load before attaching event listeners
document.addEventListener("DOMContentLoaded", function () {
    // Google login button
    const googleLoginBtn = document.getElementById("google-login-btn");
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", function () {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const user = result.user;
                    console.log(user);
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    if (error.code === 'auth/popup-closed-by-user') {
                        console.log("User closed the Google Sign-In popup.");
                    } else {
                        console.error("Google Sign-In Error:", error.code, error.message);
                    }
                });
        });
    }

    // Email and password sign-up button
    const signUpBtn = document.getElementById("sign-up-btn");
    if (signUpBtn) {
        signUpBtn.addEventListener("click", function () {
            const Firstname = document.getElementById('Fname').value;
            const Lastname = document.getElementById('Lname').value;
            const username = document.getElementById('username').value;
            const Title = document.getElementById('title').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const Cpassword = document.getElementById('Cpassword').value;

            if (password !== Cpassword) {
                alert("Passwords do not match!");
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Sign-Up Successful:", user);
                    return set(ref(db, 'users/' + user.uid), {
                        Firstname,
                        Lastname,
                        username,
                        Title,
                        email
                    });
                })
                .then(() => {
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    console.error("Sign-Up Error:", error.message);
                });
        });
    }

    // Email and password login button
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Login Successful:", user);
                    window.location.href = "dashboard.html";
                })
                .catch((error) => {
                    if (error.code === 'auth/invalid-login-credentials') {
                        alert("Invalid login credentials. Please check your email and password.");
                    } else if (error.code === 'auth/too-many-requests') {
                        alert("Too many attempts. Please wait a few minutes before trying again.");
                    } else {
                        console.error("Login Error:", error.message);
                    }
                });
        });
    }
});