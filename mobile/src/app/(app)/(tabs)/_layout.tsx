import { Tabs } from 'expo-router';
import { Home, Package, DollarSign, User } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0F172A' },
                headerTitleStyle: { color: 'white', fontWeight: 'bold' },
                tabBarStyle: {
                    backgroundColor: '#1E293B',
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#64748B',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Load Board',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="my-loads"
                options={{
                    title: 'My Loads',
                    tabBarIcon: ({ color }) => <Package size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
