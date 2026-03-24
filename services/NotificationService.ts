import { Platform } from 'react-native';

// Defensive imports to handle potentially missing native modules
let Device: any;
let Notifications: any;

try {
    Device = require('expo-device');
    Notifications = require('expo-notifications');
} catch (e) {
    console.log('[NotificationService] Native notification modules not found, falling back to dummy service');
}

// Configure how notifications are displayed when the app is in the foreground
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForPushNotificationsAsync() {
    if (!Notifications || !Device) {
        console.log('[NotificationService] Notifications or Device module missing - registration skipped');
        return null;
    }

    let token;

    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId: undefined, 
            })).data;
            console.log('Expo Push Token:', token);
        } else {
            console.log('Must use physical device for Push Notifications');
        }
    } catch (error) {
        console.log('[NotificationService] Error in registerForPushNotificationsAsync:', error);
    }

    return token;
}

export async function sendLocalNotification(title: string, body: string, data = {}) {
    if (!Notifications || typeof Notifications.scheduleNotificationAsync !== 'function') {
        console.log('[NotificationService] Cannot send local notification: module missing');
        return;
    }

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
            },
            trigger: null, // immediate
        });
    } catch (error) {
        console.log('[NotificationService] Error sending local notification:', error);
    }
}
