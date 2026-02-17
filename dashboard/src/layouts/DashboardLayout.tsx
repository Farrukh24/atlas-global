import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    Truck,
    Map,
    FileText,
    CreditCard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    PlusCircle,
    Bell,
    Search,
    ChevronLeft,
    User,
    Sun,
    Moon,
    Package,
    ArrowUpRight,
    Check,
    XCircle,
    MessageSquare,
    DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Toaster } from 'react-hot-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

import { getNavigationByRole, getThemeColorByRole } from '@/config/navigation';

export default function DashboardLayout() {
    const { t } = useLanguage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [pendingBids, setPendingBids] = useState<any[]>([]);
    const [negotiateId, setNegotiateId] = useState<number | null>(null);
    const [counterAmount, setCounterAmount] = useState('');
    const notifRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuthStore();
    const location = useLocation();

    // Get dynamic navigation and theme based on user role
    const userRole = user?.type || 'shipper';
    const navigation = getNavigationByRole(userRole);
    const themeColor = getThemeColorByRole(userRole);

    // Dynamic color classes map
    const colorClasses = {
        logoBg: {
            blue: 'bg-blue-600 shadow-blue-600/30',
            emerald: 'bg-emerald-600 shadow-emerald-600/30',
            violet: 'bg-violet-600 shadow-violet-600/30',
            gray: 'bg-gray-800 shadow-gray-800/30',
        },
        activeItemBg: {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400',
            violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/10 dark:text-violet-400',
            gray: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
        },
        activeIcon: {
            blue: 'text-blue-600',
            emerald: 'text-emerald-600',
            violet: 'text-violet-600',
            gray: 'text-gray-900 dark:text-white',
        },
        hoverText: {
            blue: 'group-hover:text-blue-500',
            emerald: 'group-hover:text-emerald-500',
            violet: 'group-hover:text-violet-500',
            gray: 'group-hover:text-gray-700 dark:group-hover:text-gray-300',
        },
        indicator: {
            blue: 'bg-blue-500',
            emerald: 'bg-emerald-500',
            violet: 'bg-violet-500',
            gray: 'bg-gray-700 dark:bg-gray-300',
        },
        button: {
            blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10',
            emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10',
            violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/10',
            gray: 'bg-gray-800 hover:bg-gray-900 shadow-gray-800/10',
        }
    };

    // Helper to get safe color class
    const getColorClass = (type: keyof typeof colorClasses) => {
        return colorClasses[type][themeColor as keyof typeof colorClasses.logoBg] || colorClasses[type].blue;
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const navigate = useNavigate();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsSearchOpen(false);
            // Navigate to find-loads with the search query
            const role = user?.type || 'carrier';
            navigate(`/${role}/find-loads?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    // Fetch notifications based on role
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            if (userRole === 'shipper') {
                const res = await api.get('/offers/shipper');
                setPendingBids(res.data?.data || []);
            } else if (userRole === 'carrier') {
                const res = await api.get('/offers/carrier/notifications');
                setPendingBids(res.data?.data || []);
            }
        } catch (err) {
            // silently fail
        }
    }, [userRole, user]);

    // Poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close notif dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
                setNegotiateId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleAcceptBid = async (bidId: number) => {
        try {
            await api.post(`/offers/${bidId}/accept`);
            toast.success('Bid accepted! Load booked.');
            setPendingBids(prev => prev.filter(b => b.id !== bidId));
        } catch {
            toast.error('Failed to accept bid');
        }
    };

    const handleRejectBid = async (bidId: number) => {
        try {
            await api.post(`/offers/${bidId}/reject`);
            toast.success('Bid rejected');
            setPendingBids(prev => prev.filter(b => b.id !== bidId));
        } catch {
            toast.error('Failed to reject bid');
        }
    };

    const handleCounterBid = async (bidId: number) => {
        if (!counterAmount) return;
        try {
            await api.post(`/offers/${bidId}/counter`, { amount: parseFloat(counterAmount) });
            toast.success('Counter offer sent');
            setPendingBids(prev => prev.filter(b => b.id !== bidId));
            setNegotiateId(null);
            setCounterAmount('');
        } catch {
            toast.error('Failed to send counter offer');
        }
    };

    const handleCarrierAcceptCounter = async (bidId: number) => {
        try {
            await api.post(`/offers/${bidId}/accept-counter`);
            toast.success('Counter offer accepted! Load booked.');
            setPendingBids(prev => prev.filter(b => b.id !== bidId));
        } catch (err) {
            toast.error('Failed to accept counter offer');
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500 overflow-hidden font-['Inter']">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 96 : 280 }}
                className={cn(
                    "hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 relative z-50 transition-colors duration-500",
                    isSidebarCollapsed ? "items-center" : "items-start"
                )}
            >
                {/* Logo Section */}
                <div className="h-20 w-full flex items-center px-8 mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-colors",
                            getColorClass('logoBg')
                        )}>
                            <span className="text-xl font-black text-white">A</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="text-2xl font-black tracking-tighter dark:text-white">ATLAS</span>
                        )}
                    </div>
                </div>

                {/* Create Action Button (Dynamic for all roles if they have a create route, or specific check) */}
                {/* For simplicity we currently keep it generic or hide, but let's re-add if needed */}
                {/* Removing Post New Load button from here as it's now in the menu items for Shipper */}

                {/* Nav Links */}
                <nav className="flex-1 w-full px-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center rounded-2xl transition-all h-14 group",
                                    isActive
                                        ? getColorClass('activeItemBg')
                                        : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40",
                                    isSidebarCollapsed ? "justify-center" : "px-6"
                                )}
                            >
                                <item.icon size={22} className={cn(
                                    isActive ? getColorClass('activeIcon') : `text-gray-400 ${getColorClass('hoverText')} transition-colors`,
                                    !isSidebarCollapsed && "mr-4"
                                )} />
                                {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">{t(`nav.${item.key}`)}</span>}
                                {isActive && !isSidebarCollapsed && (
                                    <motion.div
                                        layoutId="active"
                                        className={cn("ml-auto w-1.5 h-1.5 rounded-full", getColorClass('indicator'))}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="w-full p-4 mt-auto mb-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={cn(
                            "w-full flex items-center rounded-2xl h-14 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/40 mb-2 transition-all",
                            isSidebarCollapsed ? "justify-center" : "px-6"
                        )}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {!isSidebarCollapsed && <span className="ml-4 font-bold text-sm">{isDarkMode ? t('common.light_mode') : t('common.dark_mode')}</span>}
                    </button>

                    <button
                        onClick={logout}
                        className={cn(
                            "w-full flex items-center rounded-2xl h-14 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all",
                            isSidebarCollapsed ? "justify-center" : "px-6"
                        )}
                    >
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="ml-4 font-bold text-sm">{t('common.sign_out')}</span>}
                    </button>

                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hidden lg:flex"
                    >
                        <ChevronLeft size={16} className={cn("text-gray-500 transition-transform duration-500", isSidebarCollapsed && "rotate-180")} />
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-[60]">
                <span className="text-xl font-black tracking-tighter dark:text-white">ATLAS</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-white dark:bg-gray-900 z-[70] p-6 lg:hidden"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-2xl font-black tracking-tighter dark:text-white">ATLAS</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="space-y-4">
                            {navigation.map(item => (
                                <Link key={item.name} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-4 text-xl font-bold text-gray-600 dark:text-gray-300">
                                    <item.icon size={28} className="mr-6" />
                                    {t(`nav.${item.key}`)}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-y-auto pt-16 lg:pt-0">
                {/* Search & Profile Bar */}
                <header className="h-20 w-full bg-white/60 dark:bg-[#020617]/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500">
                    <div className="relative group flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            onClick={() => setIsSearchOpen(true)}
                            onKeyDown={handleSearch}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center space-x-6 ml-8">
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) fetchNotifications(); }}
                                className="relative p-2 text-gray-400 hover:text-primary-500 transition-colors"
                            >
                                <Bell size={22} />
                                {pendingBids.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full px-1 border-2 border-white dark:border-gray-900">
                                        {pendingBids.length}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-14 w-[420px] max-h-[500px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50"
                                    >
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
                                                {userRole === 'shipper' ? t('notifications.pending_bids') : t('notifications.counter_offers')}
                                            </h3>
                                        </div>

                                        {pendingBids.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                                                <p className="text-gray-400 text-sm font-medium">{t('notifications.no_details')}</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {pendingBids.map((bid: any) => (
                                                    <div key={bid.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                                    {userRole === 'shipper' ? (bid.carrier_name || 'Carrier') : (bid.shipper_name || 'Shipper')}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {t('notifications.load_num')} {bid.load_number || bid.load_id}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-lg font-black text-emerald-600">
                                                                    ${Number(bid.offer_amount).toLocaleString()}
                                                                </span>
                                                                {bid.offer_status === 'countered' && (
                                                                    <p className="text-[10px] text-blue-500 font-bold uppercase">{t('notifications.counter_offered')}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {bid.carrier_notes && (
                                                            <p className="text-xs text-gray-400 mb-3 truncate">{bid.carrier_notes}</p>
                                                        )}

                                                        {userRole === 'carrier' ? (
                                                            // Carrier View: Accept Counter Offer
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <button
                                                                    onClick={() => handleCarrierAcceptCounter(bid.id)}
                                                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                                >
                                                                    <Check size={14} /> {t('notifications.accept_counter')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            // Shipper View: Approve/Deny/Negotiate
                                                            negotiateId === bid.id ? (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <div className="relative flex-1">
                                                                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                                        <input
                                                                            type="number"
                                                                            value={counterAmount}
                                                                            onChange={e => setCounterAmount(e.target.value)}
                                                                            placeholder={t('notifications.your_price')}
                                                                            className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleCounterBid(bid.id)}
                                                                        className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        {t('notifications.send')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setNegotiateId(null); setCounterAmount(''); }}
                                                                        className="px-2 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <button
                                                                        onClick={() => handleAcceptBid(bid.id)}
                                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                                    >
                                                                        <Check size={14} /> {t('notifications.approve')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectBid(bid.id)}
                                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                                                    >
                                                                        <XCircle size={14} /> {t('notifications.deny')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setNegotiateId(bid.id)}
                                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        <MessageSquare size={14} /> {t('notifications.negotiate')}
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-10 w-px bg-gray-200 dark:bg-gray-800" />

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{user?.legal_name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 mt-1">{user?.type}</p>
                            </div>
                            <div className="w-12 h-12 rounded-3xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 overflow-hidden ring-4 ring-primary-500/10">
                                <span className="text-lg font-black text-white italic">{user?.legal_name?.charAt(0)}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] w-full mx-auto">
                    <Outlet />
                </div>

                {/* Global Search Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[10vh] px-6"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <motion.div
                                initial={{ y: -20, scale: 0.95 }}
                                animate={{ y: 0, scale: 1 }}
                                exit={{ y: -20, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                                        <Search className="text-primary-600" size={24} />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={handleSearch}
                                            placeholder="Search loads, routes, companies..."
                                            className="flex-1 bg-transparent border-none outline-none text-xl font-bold dark:text-white"
                                        />
                                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Advanced Filters */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
                                            <select className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-xs font-bold py-3 pr-8 focus:ring-2 focus:ring-primary-600">
                                                <option>All Status</option>
                                                <option>In Transit</option>
                                                <option>Delivered</option>
                                                <option>Pending</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Date Range</label>
                                            <select className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-xs font-bold py-3 pr-8 focus:ring-2 focus:ring-primary-600">
                                                <option>Anytime</option>
                                                <option>Last 7 Days</option>
                                                <option>Last 30 Days</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Price Min</label>
                                            <input type="number" placeholder="$0" className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-xs font-bold py-3 px-4 focus:ring-2 focus:ring-primary-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Sort By</label>
                                            <select className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-xs font-bold py-3 pr-8 focus:ring-2 focus:ring-primary-600">
                                                <option>Newest First</option>
                                                <option>Price: Low-High</option>
                                                <option>Price: High-Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Results Preview (Simulated) */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Recent Matches</h4>
                                        <div className="space-y-2">
                                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl flex items-center justify-between cursor-pointer group transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-white">AT-1001 • Tashkent → Almaty</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Load • In Transit • $2,450</p>
                                                    </div>
                                                </div>
                                                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                                            </div>
                                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl flex items-center justify-between cursor-pointer group transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl">
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-white">Silk Road Express LLC</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Carrier • Uzbekistan • 4.9⭐</p>
                                                    </div>
                                                </div>
                                                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-primary-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                        <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">ESC</kbd> to close • <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">↑↓</kbd> to navigate
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
