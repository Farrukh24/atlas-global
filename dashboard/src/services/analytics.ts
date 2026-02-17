
import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
};
