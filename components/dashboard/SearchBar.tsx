import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchBar() {
    return (
        <View style={styles.searchContainer}>
            <Image
                source={{ uri: 'https://i.pravatar.cc/100?img=33' }}
                style={styles.avatar}
            />
            <TextInput
                placeholder="Search for a place or category"
                style={styles.searchInput}
                placeholderTextColor="#999"
            />
            <TouchableOpacity>
                <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 30,
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 24,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#333',
    },
});
