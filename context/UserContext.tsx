import { auth, db } from '@/configs/firebaseConfig';
import { signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const ALL_MEDALS = [
    require('@/assets/medals/lv1.png'),
    require('@/assets/medals/lv2.png'),
    require('@/assets/medals/lv3.png'),
    require('@/assets/medals/lv4.png'),
    require('@/assets/medals/lv5.png'),
];

interface UserContextType {
    user: User | null;
    loading: boolean;
    streak: number;
    points: number;
    completedTasksToday: string[];
    userData: any;
    logout: () => Promise<void>;
    addPoints: (amount: number) => Promise<void>;
    completeTask: (taskId: string, points: number) => Promise<void>;
    isTaskCompleted: (taskId: string) => Promise<boolean>;
    level: number;
    medal: any; // Using any for require() type
    medalName: string;
    nextMedalName: string;
    xpToNextLevel: number;
    progressToNextLevel: number;
    xpInLevel: number;
    targetXp: number;
    isMaxLevel: boolean;
    lastXpGained: number;
    clearXpGained: () => void;
    medalUpgrade: MedalUpgradeInfo | null;
    clearMedalUpgrade: () => void;
}

interface MedalUpgradeInfo {
    level: number;
    medalName: string;
    medalAsset: any;
    points: number;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    streak: 0,
    points: 0,
    completedTasksToday: [],
    userData: null,
    logout: async () => { },
    addPoints: async () => { },
    completeTask: async () => { },
    isTaskCompleted: async () => false,
    level: 1,
    medal: null,
    medalName: 'Bronze',
    nextMedalName: 'Silver',
    xpToNextLevel: 50,
    progressToNextLevel: 0,
    xpInLevel: 0,
    targetXp: 50,
    isMaxLevel: false,
    lastXpGained: 0,
    clearXpGained: () => { },
    medalUpgrade: null,
    clearMedalUpgrade: () => { },
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [completedTasksToday, setCompletedTasksToday] = useState<string[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [lastXpGained, setLastXpGained] = useState(0);
    const [medalUpgrade, setMedalUpgrade] = useState<MedalUpgradeInfo | null>(null);
    const prevLevelRef = useRef<number | null>(null);

    const clearXpGained = useCallback(() => setLastXpGained(0), []);
    const clearMedalUpgrade = useCallback(() => setMedalUpgrade(null), []);

    const updateStreakAndPoints = async (currentUser: User) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserData(data);
                const lastLogin = data.lastLogin?.toDate();
                const currentStreak = data.streak || 0;
                const currentPoints = data.points || 0;

                setPoints(currentPoints);

                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const dailyProgress = data.dailyProgress || {};
                const todayTasks = dailyProgress[todayStr] || [];
                setCompletedTasksToday(todayTasks);

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (lastLogin) {
                    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
                    const differenceInTime = today.getTime() - lastLoginDate.getTime();
                    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

                    if (differenceInDays === 1) {
                        // Logged in exactly the next day
                        // We will update streak in completeTask if this is the first task of the day
                        // For now just preserve the current streak
                        setStreak(currentStreak);
                        await setDoc(userRef, {
                            lastLogin: serverTimestamp(),
                        }, { merge: true });
                    } else if (differenceInDays > 1) {
                        // Missed a day, reset streak
                        await setDoc(userRef, {
                            streak: 0,
                            lastLogin: serverTimestamp(),
                        }, { merge: true });
                        setStreak(0);
                    } else if (differenceInDays === 0) {
                        // Already logged in today
                        setStreak(currentStreak);
                    }
                } else {
                    // First time tracking
                    await setDoc(userRef, {
                        streak: 0,
                        lastLogin: serverTimestamp(),
                    }, { merge: true });
                    setStreak(0);
                }
            } else {
                // Initialize user document if not exists
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];
                const DEFAULT_PROFILE_PIC = 'https://imgs.search.brave.com/Fu2vzE7rwzQnr00qao9hegfrI2z1fW5tQy1qs01eMe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2V5LmNvbS9w/bmcvZGV0YWlsLzEy/MS0xMjE5MjMxX3Vz/ZXItZGVmYXVsdC1w/cm9maWxlLnBuZw';
                const initialData = {
                    streak: 0,
                    points: 0,
                    lastLogin: serverTimestamp(),
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photo_url: currentUser.photoURL || DEFAULT_PROFILE_PIC,
                    dailyProgress: {}
                };
                await setDoc(userRef, initialData);
                setUserData(initialData);
                setStreak(0);
                setPoints(0);
                setCompletedTasksToday([]);
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
                setUserData(null);
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
            setLastXpGained(amount);
        } catch (error) {
            console.error('Error adding points:', error);
        }
    }, [user]);

    const completeTask = useCallback(async (taskId: string, taskPoints: number) => {
        if (!user) return;
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() || {};
            const dailyProgress = userData.dailyProgress || {};
            const todayTasks = dailyProgress[today] || [];
            const currentStreak = userData.streak || 0;

            if (todayTasks.includes(taskId)) return;

            const updatedTodayTasks = [...todayTasks, taskId];
            const updates: any = {
                points: increment(taskPoints),
                [`dailyProgress.${today}`]: updatedTodayTasks,
                lastActivity: serverTimestamp()
            };

            // Streak Logic: 
            // If this is the first task today, check if yesterday had a task.
            if (todayTasks.length === 0) {
                const yesterdayTasks = dailyProgress[yesterdayStr] || [];
                if (yesterdayTasks.length > 0) {
                    // Incremental streak
                    updates.streak = increment(1);
                    setStreak(prev => prev + 1);
                } else {
                    // Start from 1 if no streak, or reset to 1 if yesterday was missed
                    updates.streak = 1;
                    setStreak(1);
                }
            }

            await setDoc(userRef, updates, { merge: true });

            setPoints(prev => prev + taskPoints);
            setCompletedTasksToday(updatedTodayTasks);
            setLastXpGained(taskPoints);

            console.log(`Task ${taskId} completed! Awarded ${taskPoints} points.`);
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

    // 5-Level System Constants
    const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500]; // Total XP needed at start of Lev 1, 2, 3, 4, 5
    const MEDAL_NAMES = ['Rookie', 'Scout', 'Voyager', 'Elite', 'Legend'];

    const getLevelData = (totalPoints: number) => {
        let currentLevel = 1;
        for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalPoints >= LEVEL_THRESHOLDS[i]) {
                currentLevel = i + 1;
                break;
            }
        }

        if (currentLevel >= 5) {
            return {
                level: 5,
                xpInLevel: totalPoints - LEVEL_THRESHOLDS[4],
                targetXp: 0,
                progress: 100,
                xpToNext: 0,
                isMax: true,
                medalName: MEDAL_NAMES[4],
                nextMedalName: 'MAX'
            };
        }

        const currentLevelStart = LEVEL_THRESHOLDS[currentLevel - 1];
        const nextLevelStart = LEVEL_THRESHOLDS[currentLevel];
        const xpInLevel = totalPoints - currentLevelStart;
        const targetXp = nextLevelStart - currentLevelStart;

        return {
            level: currentLevel,
            xpInLevel,
            targetXp,
            progress: (xpInLevel / targetXp) * 100,
            xpToNext: targetXp - xpInLevel,
            isMax: false,
            medalName: MEDAL_NAMES[currentLevel - 1],
            nextMedalName: MEDAL_NAMES[currentLevel]
        };
    };

    const levelData = getLevelData(points);

    const getMedalAsset = (lvl: number) => {
        return ALL_MEDALS[lvl - 1] || ALL_MEDALS[0];
    };

    useEffect(() => {
        if (loading) return;

        if (!user) {
            prevLevelRef.current = null;
            setMedalUpgrade(null);
            return;
        }

        if (prevLevelRef.current === null) {
            prevLevelRef.current = levelData.level;
            return;
        }

        if (levelData.level > prevLevelRef.current) {
            setMedalUpgrade({
                level: levelData.level,
                medalName: levelData.medalName,
                medalAsset: getMedalAsset(levelData.level),
                points,
            });
        }

        prevLevelRef.current = levelData.level;
    }, [loading, user, levelData.level, levelData.medalName, points]);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            logout,
            streak,
            points,
            completedTasksToday,
            userData,
            addPoints,
            completeTask,
            isTaskCompleted,
            level: levelData.level,
            medal: getMedalAsset(levelData.level),
            medalName: levelData.medalName,
            nextMedalName: levelData.nextMedalName,
            xpToNextLevel: levelData.xpToNext,
            progressToNextLevel: levelData.progress,
            xpInLevel: levelData.xpInLevel,
            targetXp: levelData.targetXp,
            isMaxLevel: levelData.isMax,
            lastXpGained,
            clearXpGained,
            medalUpgrade,
            clearMedalUpgrade
        }}>
            {children}
        </UserContext.Provider>
    );
};

