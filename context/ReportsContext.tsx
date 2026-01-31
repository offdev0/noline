import { db } from '@/configs/firebaseConfig';
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    Timestamp as FirebaseTimestamp,
    GeoPoint,
    increment,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

export interface CommentData {
    id: string;
    reportId: string;
    userId: string;
    userEmail: string;
    text: string;
    timestamp: FirebaseTimestamp;
}

export interface ReportData {
    id: string;
    placeName: string;
    Timestamp: FirebaseTimestamp;
    isOpen: boolean;
    location: GeoPoint;
    description: string;
    likes: string[]; // List of user emails or IDs
    commentsCount: number;
    HELPCOUNT: string;
    notes: string;
    irrelevant: string;
    businessRef: string;
    reportNumberCount: number;
    reportBy: string;
    Hplacename: string;
    crowdLevel: number;
    liveSituation: string;
}

interface ReportsContextType {
    reports: ReportData[];
    addReport: (report: Omit<ReportData, 'id' | 'Timestamp' | 'likes' | 'commentsCount' | 'HELPCOUNT'>) => Promise<void>;
    toggleLike: (reportId: string) => Promise<void>;
    addComment: (reportId: string, text: string) => Promise<void>;
    getComments: (reportId: string, callback: (comments: CommentData[]) => void) => () => void;
    getReportsByPlace: (placeId: string) => ReportData[];
    loading: boolean;
}

const ReportsContext = createContext<ReportsContextType>({
    reports: [],
    addReport: async () => { },
    toggleLike: async () => { },
    addComment: async () => { },
    getComments: () => () => { },
    getReportsByPlace: () => [],
    loading: false,
});

export const useReports = () => useContext(ReportsContext);

export const ReportsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'REPRORT'), orderBy('Timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReports: ReportData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedReports.push({
                    id: doc.id,
                    ...data,
                } as ReportData);
            });
            setReports(fetchedReports);
            setLoading(false);
        }, (error) => {
            console.error('Firestore Subscription Error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addReport = async (data: Omit<ReportData, 'id' | 'Timestamp' | 'likes' | 'commentsCount' | 'HELPCOUNT'>) => {
        try {
            await addDoc(collection(db, 'REPRORT'), {
                ...data,
                Timestamp: serverTimestamp(),
                likes: [],
                commentsCount: 0,
                HELPCOUNT: '0',
            });
        } catch (error) {
            console.error('Error adding report:', error);
            throw error;
        }
    };

    const toggleLike = async (reportId: string) => {
        if (!user) return;
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        const reportRef = doc(db, 'REPRORT', reportId);
        const isLiked = report.likes?.includes(user.email || '');

        try {
            await updateDoc(reportRef, {
                likes: isLiked ? arrayRemove(user.email) : arrayUnion(user.email)
            });
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async (reportId: string, text: string) => {
        if (!user || !text.trim()) return;

        const reportRef = doc(db, 'REPRORT', reportId);
        const commentsColl = collection(db, 'COMMENTS');

        try {
            await runTransaction(db, async (transaction) => {
                // Add the comment
                const newCommentRef = doc(commentsColl);
                transaction.set(newCommentRef, {
                    reportId,
                    userId: user.uid,
                    userEmail: user.email,
                    text: text.trim(),
                    timestamp: serverTimestamp(),
                });

                // Increment comment count on report
                transaction.update(reportRef, {
                    commentsCount: increment(1)
                });
            });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getComments = (reportId: string, callback: (comments: CommentData[]) => void) => {
        const q = query(
            collection(db, 'COMMENTS'),
            where('reportId', '==', reportId),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const fetchedComments: CommentData[] = [];
            snapshot.forEach((doc) => {
                fetchedComments.push({ id: doc.id, ...doc.data() } as CommentData);
            });
            callback(fetchedComments);
        });
    };

    const getReportsByPlace = (placeId: string) => {
        return reports.filter(r => r.businessRef === placeId);
    };

    return (
        <ReportsContext.Provider value={{
            reports,
            addReport,
            toggleLike,
            addComment,
            getComments,
            getReportsByPlace,
            loading
        }}>
            {children}
        </ReportsContext.Provider>
    );
};

import { where } from 'firebase/firestore';
