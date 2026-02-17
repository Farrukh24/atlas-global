import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { hydrate, isAuthenticated } = useAuthStore();
    const [loaded, error] = useFonts({
        // Add custom fonts here if needed
    });

    useEffect(() => {
        hydrate().then(() => {
            if (loaded) {
                SplashScreen.hideAsync();
            }
        });
    }, [loaded]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="(app)" />
            ) : (
                <Stack.Screen name="(auth)" />
            )}
        </Stack>
    );
}
