import {
    LayoutDashboard,
    PlusCircle,
    Package,
    Truck,
    BarChart3,
    Settings,
    Search,
    Home,
    Users,
    DollarSign,
    FileText,
    Shield,
    Plus,
    Star,
    PackageCheck,
    Gavel,
    TrendingUp,
    CreditCard,
    ScrollText
} from 'lucide-react';

export const getNavigationByRole = (role: string = 'shipper') => {
    // Normalize role to lowercase for safety
    const safeRole = role.toLowerCase();

    const navigation = {
        shipper: [
            {
                key: 'dashboard',
                name: 'Главная',
                icon: Home,
                href: '/dashboard/shipper'
            },
            {
                key: 'create_load',
                name: 'Создать груз',
                icon: Plus,
                href: '/dashboard/create-load'
            },
            {
                key: 'my_loads',
                name: 'Мои грузы',
                icon: Package,
                href: '/dashboard/my-loads'
            },
            {
                key: 'top_carriers',
                name: 'Лучшие перевозчики',
                icon: Star,
                href: '/dashboard/top-carriers'
            },
            {
                key: 'reports',
                name: 'Отчёты',
                icon: BarChart3,
                href: '/dashboard/reports'
            },
            {
                key: 'market_analysis',
                name: 'Анализ рынка',
                icon: TrendingUp,
                href: '/dashboard/market-analysis'
            },
            {
                key: 'documents',
                name: 'Документы',
                icon: ScrollText,
                href: '/dashboard/documents'
            },
            {
                key: 'settings',
                name: 'Настройки',
                icon: Settings,
                href: '/dashboard/settings'
            }
        ],
        carrier: [
            { key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { key: 'find_loads', name: 'Find Loads', href: '/dashboard/find-loads', icon: Search },
            { key: 'my_bids', name: 'My Bids', href: '/dashboard/my-bids', icon: FileText },
            { key: 'my_hauls', name: 'My Hauls', href: '/dashboard/my-hauls', icon: PackageCheck },
            { key: 'earnings', name: 'Earnings', href: '/dashboard/earnings', icon: DollarSign },
            { key: 'my_rating', name: 'My Rating', href: '/dashboard/my-rating', icon: Star },
            { key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
        broker: [
            { key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { key: 'available_loads', name: 'Available Loads', href: '/dashboard/available-loads', icon: Package },
            { key: 'my_bids', name: 'My Bids', href: '/dashboard/my-bids', icon: Gavel },
            { key: 'carriers_db', name: 'Carriers DB', href: '/dashboard/carriers-db', icon: Users },
            { key: 'analytics', name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
            { key: 'finances', name: 'Finances', href: '/dashboard/finances', icon: DollarSign },
            { key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
        admin: [
            { key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { key: 'users', name: 'Users', href: '/dashboard/users', icon: Users },
            { key: 'all_loads', name: 'All Loads', href: '/dashboard/all-loads', icon: Package },
            { key: 'transactions', name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
            { key: 'logs', name: 'Logs', href: '/dashboard/logs', icon: ScrollText },
            { key: 'platform_settings', name: 'Platform Settings', href: '/dashboard/platform-settings', icon: Settings },
            { key: 'security', name: 'Security', href: '/dashboard/security', icon: Shield },
        ],
    };

    // Return the specific role navigation or fallback to shipper
    return navigation[safeRole as keyof typeof navigation] || navigation.shipper;
};

export const getThemeColorByRole = (role: string = 'shipper') => {
    const safeRole = role.toLowerCase();

    // Returning Tailwind generic color names to be used in template literals
    // Note: This assumes standard tailwind colors are available
    switch (safeRole) {
        case 'shipper': // Blue #3B82F6
            return 'blue';
        case 'carrier': // Green #10B981 (Emerald)
            return 'emerald';
        case 'broker': // Violet #8B5CF6
            return 'violet';
        case 'admin': // Dark #1F2937 (Gray)
            return 'gray';
        default:
            return 'blue';
    }
};
