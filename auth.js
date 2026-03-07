/**
 * GRIFA AUTH - Firebase Authentication Logic
 */

// Your web app's Firebase configuration
// Replace this with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyAHdIRkpVKKUfb9khe2IqRdsZgwFveDLh8",
    authDomain: "grifa-games.firebaseapp.com",
    projectId: "grifa-games",
    storageBucket: "grifa-games.firebasestorage.app",
    messagingSenderId: "348172405811",
    appId: "1:348172405811:web:a7144d57c23706e8dfa746"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
window.auth = auth;
window.db = db;

// Google Login
document.getElementById('google-login')?.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(res => {
        window.location.href = 'index.html';
    }).catch(err => {
        alert("خطأ في تسجيل الدخول: " + err.message);
    });
});

// Email/Pass Login & Register
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => window.location.href = 'index.html')
        .catch(err => {
            if (err.code === 'auth/user-not-found') {
                return auth.createUserWithEmailAndPassword(email, password);
            }
            alert(err.message);
        });
});

// Auth Persistence Check
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem('grifa_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        }));
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        localStorage.removeItem('grifa_user');
    }
});
