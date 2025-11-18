import React, { createContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (initializing) {
                setInitializing(false);
            }
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return null; 
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login: (email, password) => signInWithEmailAndPassword(auth, email, password),
                register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
                logout: () => signOut(auth),
                resetPassword: (email) => sendPasswordResetEmail(auth, email)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};