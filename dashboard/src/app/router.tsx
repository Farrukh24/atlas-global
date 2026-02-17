import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import AdminDashboard from '@/pages/admin/Dashboard';
import BrokerDashboard from '@/pages/broker/Dashboard';
import ShipperDashboard from '@/pages/shipper/Dashboard';
import CarrierDashboard from '@/pages/carrier/Dashboard';
import LoadBoard from '@/pages/broker/LoadBoard';
import ShipperCreateLoad from '@/pages/shipper/CreateLoad';
import ShipperMyLoads from '@/pages/shipper/MyLoads';
import ShipperTopCarriers from '@/pages/shipper/TopCarriers';
import ShipperReports from '@/pages/shipper/Reports';
import ShipperMarketAnalysis from '@/pages/shipper/MarketAnalysis';
import ShipperDocuments from '@/pages/shipper/Documents';
import ShipperSettings from '@/pages/shipper/Settings';
import CarrierFindLoads from '@/pages/carrier/FindLoads';
import CarrierMyBids from '@/pages/carrier/MyBids';
import CarrierMyHauls from '@/pages/carrier/MyHauls';
import CarrierEarnings from '@/pages/carrier/Earnings';
import CarrierRating from '@/pages/carrier/Rating';
import CarrierSettings from '@/pages/carrier/Settings';

export default function AppRouter() {
    const { isAuthenticated, user } = useAuthStore();

    const getDashboardRedirect = () => {
        if (!user) return '/login';
        // Backend returns 'type', not 'party_type'
        switch (user.type) {
            case 'admin': return '/dashboard/admin';
            case 'shipper': return '/dashboard/shipper';
            case 'broker': return '/dashboard/broker';
            case 'carrier': return '/dashboard/carrier';
            default: return '/dashboard/shipper';
        }
    };

    const RoleProtectedRoute = ({
        allowedRoles,
        children
    }: {
        allowedRoles: string[];
        children: React.ReactNode
    }) => {
        if (!isAuthenticated) return <Navigate to="/login" />;
        if (!user || !allowedRoles.includes(user.type)) {
            return <Navigate to={getDashboardRedirect()} replace />;
        }
        return <>{children}</>;
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRedirect()} />} />

            {/* Auth Layout Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardRedirect()} />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
                <Route path="/" element={<Navigate to={getDashboardRedirect()} replace />} />

                <Route path="/dashboard/carrier" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierDashboard />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/shipper" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperDashboard />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/broker" element={
                    <RoleProtectedRoute allowedRoles={['broker']}>
                        <BrokerDashboard />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={
                    <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </RoleProtectedRoute>
                } />

                {/* Load Management */}
                <Route path="/loads" element={<LoadBoard />} />
                <Route path="/dashboard/create-load" element={
                    <RoleProtectedRoute allowedRoles={['shipper', 'broker']}>
                        <ShipperCreateLoad />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/my-loads" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperMyLoads />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/top-carriers" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperTopCarriers />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/reports" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperReports />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/market-analysis" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperMarketAnalysis />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/documents" element={
                    <RoleProtectedRoute allowedRoles={['shipper']}>
                        <ShipperDocuments />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                    <RoleProtectedRoute allowedRoles={['shipper', 'carrier']}>
                        {user?.type === 'carrier' ? <CarrierSettings /> : <ShipperSettings />}
                    </RoleProtectedRoute>
                } />

                {/* Carrier Routes */}
                <Route path="/dashboard/find-loads" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierFindLoads />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/my-bids" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierMyBids />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/my-hauls" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierMyHauls />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/earnings" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierEarnings />
                    </RoleProtectedRoute>
                } />
                <Route path="/dashboard/my-rating" element={
                    <RoleProtectedRoute allowedRoles={['carrier']}>
                        <CarrierRating />
                    </RoleProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
}
