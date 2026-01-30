import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MapWidget() {
    return (
        <View style={styles.mapWidgetContainer}>
            <View style={styles.mapPreview}>
                <Image
                    source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&maptype=roadmap&key=YOUR_API_KEY_HERE' }}
                    style={styles.mapImage}
                />
                <View style={[styles.mapOverlayBox, { zIndex: 2 }]}>
                    <Text style={styles.overlayTitle}>Location</Text>
                    <Text style={styles.overlayText}>Current Location near you.</Text>
                </View>

                <View style={styles.floatingMapButtonContainer}>
                    <TouchableOpacity style={styles.openMapButton}>
                        <Ionicons name="map-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.openMapText}>Open full map</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapWidgetContainer: {
        marginHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
        padding: 8,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    mapPreview: {
        borderRadius: 16,
        height: 200,
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    mapOverlayBox: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    overlayTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    overlayText: {
        color: '#666',
        fontSize: 14,
    },
    floatingMapButtonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    openMapButton: {
        backgroundColor: '#5356FF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    openMapText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
