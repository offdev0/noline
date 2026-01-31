import { auth, db } from '@/configs/firebaseConfig';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface UserContextType {
    user: User | null;
    loading: boolean;
    streak: number;
    points: number;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    streak: 0,
    points: 0,
    logout: async () => { },
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);

    const updateStreakAndPoints = async (currentUser: User) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                const lastLogin = data.lastLogin?.toDate();
                const currentStreak = data.streak || 0;
                const currentPoints = data.points || 0;

                setPoints(currentPoints);

                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (lastLogin) {
                    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
                    const differenceInTime = today.getTime() - lastLoginDate.getTime();
                    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

                    if (differenceInDays === 1) {
                        // Logged in exactly the next day
                        const newStreak = currentStreak + 1;
                        await updateDoc(userRef, {
                            streak: newStreak,
                            lastLogin: serverTimestamp(),
                        });
                        setStreak(newStreak);
                    } else if (differenceInDays > 1) {
                        // Missed a day, reset streak
                        await updateDoc(userRef, {
                            streak: 1,
                            lastLogin: serverTimestamp(),
                        });
                        setStreak(1);
                    } else if (differenceInDays === 0) {
                        // Already logged in today
                        setStreak(currentStreak);
                    }
                } else {
                    // First time tracking streak
                    await updateDoc(userRef, {
                        streak: 1,
                        lastLogin: serverTimestamp(),
                    });
                    setStreak(1);
                }
            } else {
                // Initialize user document if not exists (minimal)
                setStreak(1);
                setPoints(0);
            }
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser ? 'User logged in' : 'User logged out');
            setUser(currentUser);
            if (currentUser) {
                updateStreakAndPoints(currentUser);
            } else {
                setStreak(0);
                setPoints(0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        try {
            console.log('Logging out...');
            await firebaseSignOut(auth);
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, logout, streak, points }}>
            {children}
        </UserContext.Provider>
    );
};

