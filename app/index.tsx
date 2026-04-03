import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function EntryPoint() {
    const router = useRouter();

    React.useEffect(() => {
        // Redirect immediately to login for new users
        // If already logged in, root _layout will handle the redirect to (tabs)
        router.replace('/login');
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
    );
}
