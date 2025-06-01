import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

export async function initializeUser(userId, email) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // Create new user with 10 free requests
        await setDoc(userRef, {
            email,
            remainingRequests: 10,
            createdAt: new Date().toISOString()
        });
    }

    return userDoc.data();
}

export async function getUserData(userId) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data();
}

export async function decrementRequests(userId) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        remainingRequests: increment(-1)
    });
}

export async function addRequests(userId, amount) {
    const userRef = doc(db, 'users', userId);
    const requestsToAdd = amount === 1000 ? 100 : 500; // $10 for 100, $40 for 500
    
    await updateDoc(userRef, {
        remainingRequests: increment(requestsToAdd)
    });
} 