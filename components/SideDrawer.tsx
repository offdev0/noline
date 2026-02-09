import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

interface SideDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    userEmail?: string;
}

export default function SideDrawer({ isVisible, onClose, userEmail }: SideDrawerProps) {
    const router = useRouter();
    const { logout, userData, level, medal, medalName, progressToNextLevel, xpToNextLevel, nextMedalName, points, streak } = useUser();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const displayName = userData?.display_name || userEmail?.split('@')[0] || t('places.user');
    const profilePic = userData?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366F1&color=fff&size=128`;

    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Animate drawer visibility
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

    // Handle logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            onClose();
            await new Promise(resolve => setTimeout(resolve, 100));
            await logout();
            router.replace('/');
        } catch (error) {
            console.error("Error signing out: ", error);
            setIsLoggingOut(false);
        }
    };

    // Helper for menu items
    const MenuItem = ({ icon, label, onPress, isDestructive = false, isLoading = false }: any) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            disabled={isLoading}
        >
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#555" />
                    ) : (
                        <Ionicons name={icon} size={20} color={isDestructive ? '#FF4444' : '#555'} />
                    )}
                </View>
                <Text style={[styles.menuItemLabel, isDestructive && styles.destructiveLabel]}>
                    {isLoading ? t('drawer.loggingOut') : label}
                </Text>
            </View>
            {!isLoading && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
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
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.backdropTouch}
                    onPress={onClose}
                    activeOpacity={1}
                    disabled={isLoggingOut}
                />
            </Animated.View>

            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={onClose} disabled={isLoggingOut}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{t('drawer.myProfile')}</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        <View style={styles.profileInfoContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: profilePic }}
                                    style={styles.avatar}
                                />
                            </View>
                            <Text style={styles.displayName}>{userData?.display_name || userEmail?.split('@')[0] || t('places.user')}</Text>
                        </View>

                        <View style={styles.levelCard}>
                            <View style={styles.levelHeader}>
                                <View style={styles.medalIcon}>
                                    <Ionicons
                                        name={medal === 'Bronze' ? 'medal' : 'trophy'}
                                        size={32}
                                        color={
                                            medal === 'Bronze' ? '#CD7F32' :
                                                medal === 'Silver' ? '#C0C0C0' :
                                                    medal === 'Gold' ? '#FFD700' :
                                                        medal === 'Platinum' ? '#E5E4E2' : '#B9F2FF'
                                        }
                                    />
                                </View>
                                <View style={styles.levelTexts}>
                                    <Text style={styles.levelTitle}>{t('drawer.levelMedal', { level, medal: medalName })}</Text>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${progressToNextLevel}%` }]} />
                                    </View>
                                    <Text style={styles.xpText}>{t('drawer.xpToNext', { xp: xpToNextLevel, nextMedal: nextMedalName })}</Text>
                                </View>
                            </View>
                            {streak > 0 && <Text style={styles.streakInfo}>{t('drawer.streak', { count: streak })}</Text>}
                        </View>

                        <SectionHeader title={t('drawer.personalArea')} />
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="star"
                                label={t('drawer.favorites')}
                                onPress={() => {
                                    onClose();
                                    router.push('/favorites');
                                }}
                            />
                            <MenuItem
                                icon="notifications"
                                label={t('drawer.customNotifications')}
                                onPress={() => {
                                    onClose();
                                    router.push('/(tabs)/customized');
                                }}
                            />
                            <MenuItem
                                icon="person-add"
                                label={t('drawer.profileSharing')}
                                onPress={async () => {
                                    try {
                                        await Share.share({
                                            message: t('drawer.shareProfile', { level, medal: medalName }),
                                        });
                                    } catch (error: any) {
                                        console.error(error.message);
                                    }
                                }}
                            />
                        </View>

                        <SectionHeader title={t('drawer.settings')} />
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="settings"
                                label={t('drawer.generalSettings')}
                                onPress={() => {
                                    onClose();
                                    router.push('/settings/general');
                                }}
                            />
                            <MenuItem
                                icon="person"
                                label={t('drawer.accountDetails')}
                                onPress={() => {
                                    onClose();
                                    router.push('/account/details');
                                }}
                            />
                            <MenuItem
                                icon="star-half"
                                label={t('drawer.rateUs')}
                                onPress={() => {
                                    const storeUrl = Platform.OS === 'ios'
                                        ? 'https://apps.apple.com/app/noline' // Replace with actual ID
                                        : 'https://play.google.com/store/apps/details?id=app.noline.user';
                                    Linking.openURL(storeUrl).catch(err => console.error("Couldn't open store", err));
                                }}
                            />
                            <MenuItem
                                icon="share-social"
                                label={t('drawer.tellFriends')}
                                onPress={async () => {
                                    try {
                                        await Share.share({
                                            message: t('drawer.shareApp'),
                                        });
                                    } catch (error: any) {
                                        console.error(error.message);
                                    }
                                }}
                            />
                        </View>

                        <SectionHeader title={t('drawer.support')} />
                        <View style={styles.menuGroup}>
                            <MenuItem
                                icon="help-circle"
                                label={t('drawer.helpSupport')}
                                onPress={() => {
                                    onClose();
                                    router.push('/help');
                                }}
                            />
                            <MenuItem
                                icon="mail-outline"
                                label={t('drawer.contactUs')}
                                onPress={() => {
                                    Linking.openURL('mailto:support@noline.app');
                                }}
                            />
                        </View>

                        <SectionHeader title={t('drawer.account')} />
                        <View style={styles.menuGroup}>
                            <MenuItem icon="swap-horizontal" label={t('drawer.accountSwitch')} />
                            <MenuItem
                                icon="log-out-outline"
                                label={t('drawer.exit')}
                                onPress={handleLogout}
                                isDestructive
                                isLoading={isLoggingOut}
                            />
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
        zIndex: 100,
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
        backgroundColor: '#F8F9FA',
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
        color: '#6366F1',
        fontWeight: '600'
    },
    streakInfo: {
        fontSize: 12,
        color: '#F97316',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 4
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
        backgroundColor: 'white',
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
        color: '#FF4444',
    }
});
