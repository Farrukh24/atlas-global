import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    get: async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Storage Error Reference:', e);
            return null;
        }
    },
    set: async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage Error Write:', e);
        }
    },
    remove: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Storage Error Remove:', e);
        }
    },
};
