import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

interface SideDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    userEmail?: string;
}

export default function SideDrawer({ isVisible, onClose, userEmail }: SideDrawerProps) {
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    // Helper for menu items
    const MenuItem = ({ icon, label, onPress, isDestructive = false }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                    <Ionicons name={icon} size={20} color="#555" />
                </View>
                <Text style={[styles.menuItemLabel, isDestructive && styles.destructiveLabel]}>
                    {label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Overlay Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
            </Animated.View>

            {/* Drawer Content */}
            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        {/* Close Button Header */}
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>My profile</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Profile Info */}
                        <View style={styles.profileInfoContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: 'https://i.pravatar.cc/150?img=33' }}
                                    style={styles.avatar}
                                />
                            </View>
                            <Text style={styles.displayName}>{userEmail?.split('@')[0] || '[Display Name]'}</Text>
                        </View>

                        {/* Level / XP Card */}
                        <View style={styles.levelCard}>
                            <View style={styles.levelHeader}>
                                <View style={styles.medalIcon}>
                                    <Ionicons name="medal-outline" size={32} color="#666" />
                                </View>
                                <View style={styles.levelTexts}>
                                    <Text style={styles.levelTitle}>Level 3 - Keep growing!</Text>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: '60%' }]} />
                                    </View>
                                    <Text style={styles.xpText}>310 / 500 XP to the next level</Text>
                                </View>
                            </View>
                            <Text style={styles.reportsText}>You're 3 reports away from your next medal!</Text>
                        </View>

                        {/* My Personal Area */}
                        <SectionHeader title="My personal area" />
                        <View style={styles.menuGroup}>
                            <MenuItem icon="star" label="Favorites" />
                            <MenuItem icon="notifications" label="Customized notifications" />
                            <MenuItem icon="person-add" label="Profile sharing" />
                        </View>

                        {/* Settings */}
                        <SectionHeader title="Settings" />
                        <View style={styles.menuGroup}>
                            <MenuItem icon="settings" label="General settings" />
                            <MenuItem icon="person" label="Account details" />
                            <MenuItem icon="star-half" label="Rate us" />
                            <MenuItem icon="share-social" label="Tell your friends about NoLine" />
                        </View>

                        {/* Support */}
                        <SectionHeader title="support" />
                        <View style={styles.menuGroup}>
                            <MenuItem icon="help-circle" label="Help and support" />
                            <MenuItem icon="information-circle" label="about" />
                        </View>

                        {/* Entry/Exit */}
                        <SectionHeader title="entry" />
                        <View style={styles.menuGroup}>
                            <MenuItem icon="swap-horizontal" label="Account switching" />
                            <MenuItem icon="log-out-outline" label="exit" onPress={() => {
                                onClose();
                            }} />
                        </View>

                        <View style={{ height: 50 }} />
                    </ScrollView>
                </SafeAreaView>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 100, // Below drawer, above content
    },
    backdropTouch: {
        width: '100%',
        height: '100%',
    },
    drawerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: '#F8F9FA', // Light greyish background from screenshot
        zIndex: 101,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    displayName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    levelCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    medalIcon: {
        marginRight: 12,
    },
    levelTexts: {
        flex: 1,
    },
    levelTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#5356FF',
        borderRadius: 3,
    },
    xpText: {
        fontSize: 10,
        color: '#888',
    },
    reportsText: {
        fontSize: 11,
        color: '#5356FF',
        textAlign: 'center',
        fontWeight: '500'
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    menuGroup: {
        backgroundColor: 'white', // Card style groups
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        // Border separator logic if needed
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 24,
        marginRight: 12,
        alignItems: 'center',
    },
    menuItemLabel: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    destructiveLabel: {
        color: 'red',
    }
});
