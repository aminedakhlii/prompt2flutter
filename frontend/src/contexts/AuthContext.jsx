import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { initializeUser, getUserData } from '../services/firestore';
import { app } from '../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signInWithGoogle() {
        try {
            console.log('Starting Google sign in process...');
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google sign in successful:', result.user.uid);
            
            const userData = await initializeUser(result.user.uid, result.user.email);
            console.log('User data initialized:', userData);
            
            const user = {
                id: result.user.uid,
                email: result.user.email,
                remaining_requests: userData.remainingRequests
            };
            console.log('Setting current user:', user);
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Error in signInWithGoogle:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            console.log('Starting logout process...');
            await signOut(auth);
            console.log('Sign out successful');
            setCurrentUser(null);
        } catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }

    useEffect(() => {
        console.log('Setting up auth state listener...');
        let unsubscribeUser = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    
                    // First check if user document exists
                    const userDoc = await getDoc(userRef);
                    
                    if (userDoc.exists()) {                        
                        // Clean up previous listener if it exists
                        if (unsubscribeUser) {
                            unsubscribeUser();
                        }

                        // Set up real-time listener for user data
                        unsubscribeUser = onSnapshot(userRef, (doc) => {
                            if (doc.exists()) {
                                const userData = {
                                    id: user.uid,
                                    email: user.email,
                                    remaining_requests: doc.data().remainingRequests
                                };
                                setCurrentUser(userData);
                            } else {
                                setCurrentUser(null);
                            }
                        }, (error) => {
                            console.error('Error in user data listener:', error);
                            setCurrentUser(null);
                        });

                        // Initial user data
                        const initialUserData = {
                            id: user.uid,
                            email: user.email,
                            remaining_requests: userDoc.data().remainingRequests
                        };
                        setCurrentUser(initialUserData);
                    } else {
                        const newUserData = await initializeUser(user.uid, user.email);
                        const userData = {
                            id: user.uid,
                            email: user.email,
                            remaining_requests: newUserData.remainingRequests
                        };
                        setCurrentUser(userData);
                    }
                } catch (error) {
                    console.error('Error in auth state change handler:', error);
                    console.error('Error details:', {
                        code: error.code,
                        message: error.message,
                        stack: error.stack
                    });
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error in auth state listener:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            setLoading(false);
        });

        return () => {
            if (unsubscribeUser) {
                unsubscribeUser();
            }
            unsubscribe();
        };
    }, []);

    const value = {
        currentUser,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 