import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlacesScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Places</Text>
            <Text>Map view coming soon...</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    }
});
