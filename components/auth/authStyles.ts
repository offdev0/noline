import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
});

// Gradient colors for auth screens (purple + blue)
export const AUTH_GRADIENT_COLORS: readonly [string, string] = ['#7C3AED', '#1D4ED8'];

// Onboarding image style
export const authImageStyles = StyleSheet.create({
    topImage: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 12,
        resizeMode: 'contain',
    },
});
