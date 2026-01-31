import { db } from '@/configs/firebaseConfig';
import {
    addDoc,
    collection,
    GeoPoint,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ReportData {
    id: string;
    placeName: string;
    Timestamp: any; // Firestore serverTimestamp
    isOpen: boolean;
    location: GeoPoint;
    description: string;
    likes: string[]; // List of user references or IDs
    commentsCount: number;
    HELPCOUNT: string;
    notes: string;
    irrelevant: string;
    businessRef: string; // Reference to the place (as a string ID for simplicity or doc ref)
    reportNumberCount: number;
    reportBy: string; // Reference to user
    Hplacename: string;
    crowdLevel: number; // 1-Short, 2-Medium, 3-Long
    liveSituation: string;
}

interface ReportsContextType {
    reports: ReportData[];
    addReport: (report: Omit<ReportData, 'id' | 'Timestamp' | 'likes' | 'commentsCount' | 'HELPCOUNT'>) => Promise<void>;
    getReportsByPlace: (placeId: string) => ReportData[];
    loading: boolean;
}

const ReportsContext = createContext<ReportsContextType>({
    reports: [],
    addReport: async () => { },
    getReportsByPlace: () => [],
    loading: false,
});

export const useReports = () => useContext(ReportsContext);

export const ReportsProvider = ({ children }: { children: React.ReactNode }) => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to ALL reports in real-time from Firebase
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
            console.error('Error adding report to Firebase:', error);
            throw error;
        }
    };

    const getReportsByPlace = (placeId: string) => {
        return reports.filter(r => r.businessRef === placeId);
    };

    return (
        <ReportsContext.Provider value={{ reports, addReport, getReportsByPlace, loading }}>
            {children}
        </ReportsContext.Provider>
    );
};
