import { auth, db } from '@/configs/firebaseConfig';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface UserContextType {
    user: User | null;
    loading: boolean;
    streak: number;
    points: number;
    completedTasksToday: string[];
    logout: () => Promise<void>;
    addPoints: (amount: number) => Promise<void>;
    completeTask: (taskId: string, points: number) => Promise<void>;
    isTaskCompleted: (taskId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    streak: 0,
    points: 0,
    completedTasksToday: [],
    logout: async () => { },
    addPoints: async () => { },
    completeTask: async () => { },
    isTaskCompleted: async () => false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [completedTasksToday, setCompletedTasksToday] = useState<string[]>([]);

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
                const todayStr = now.toISOString().split('T')[0];
                const dailyProgress = data.dailyProgress || {};
                setCompletedTasksToday(dailyProgress[todayStr] || []);

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (lastLogin) {
                    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
                    const differenceInTime = today.getTime() - lastLoginDate.getTime();
                    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

                    if (differenceInDays === 1) {
                        // Logged in exactly the next day
                        const newStreak = currentStreak + 1;
                        await setDoc(userRef, {
                            streak: newStreak,
                            lastLogin: serverTimestamp(),
                        }, { merge: true });
                        setStreak(newStreak);
                        await completeTask('daily_login', 10);
                    } else if (differenceInDays > 1) {
                        // Missed a day, reset streak
                        await setDoc(userRef, {
                            streak: 1,
                            lastLogin: serverTimestamp(),
                        }, { merge: true });
                        setStreak(1);
                        await completeTask('daily_login', 10);
                    } else if (differenceInDays === 0) {
                        // Already logged in today
                        setStreak(currentStreak);
                    }
                } else {
                    // First time tracking streak
                    await setDoc(userRef, {
                        streak: 1,
                        lastLogin: serverTimestamp(),
                    }, { merge: true });
                    setStreak(1);
                    await completeTask('daily_login', 10);
                }
            } else {
                // Initialize user document if not exists
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const initialData = {
                    streak: 1,
                    points: 0,
                    lastLogin: serverTimestamp(),
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    dailyProgress: {
                        [todayStr]: ['daily_login']
                    }
                };
                await setDoc(userRef, initialData);
                setStreak(1);
                setPoints(10); // 10 points for first login
                setCompletedTasksToday(['daily_login']);
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

    const addPoints = useCallback(async (amount: number) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                points: increment(amount)
            }, { merge: true });
            setPoints(prev => prev + amount);
        } catch (error) {
            console.error('Error adding points:', error);
        }
    }, [user]);

    const completeTask = useCallback(async (taskId: string, taskPoints: number) => {
        if (!user) return;
        try {
            const today = new Date().toISOString().split('T')[0];


            // Using a simpler approach: store daily completion in a field in the user doc
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() || {};
            const dailyProgress = userData.dailyProgress || {};
            const todayTasks = dailyProgress[today] || [];

            if (todayTasks.includes(taskId)) return;

            const updatedTodayTasks = [...todayTasks, taskId];

            await setDoc(userRef, {
                points: increment(taskPoints),
                [`dailyProgress.${today}`]: updatedTodayTasks
            }, { merge: true });

            setPoints(prev => prev + taskPoints);
            setCompletedTasksToday(updatedTodayTasks);
            if (taskPoints > 0) {
                console.log(`Task ${taskId} completed! Awarded ${taskPoints} points.`);
            } else {
                console.log(`Task ${taskId} marked as completed.`);
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    }, [user]);

    const isTaskCompleted = useCallback(async (taskId: string) => {
        if (!user) return false;
        try {
            const today = new Date().toISOString().split('T')[0];
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() || {};
            const dailyProgress = userData.dailyProgress || {};
            const todayTasks = dailyProgress[today] || [];
            return todayTasks.includes(taskId);
        } catch (error) {
            return false;
        }
    }, [user]);

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
        <UserContext.Provider value={{ user, loading, logout, streak, points, completedTasksToday, addPoints, completeTask, isTaskCompleted }}>
            {children}
        </UserContext.Provider>
    );
};

