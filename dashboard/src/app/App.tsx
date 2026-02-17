import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import { LanguageProvider } from '@/i18n/LanguageContext';

function App() {
    const hydrate = useAuthStore((state) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return (
        <LanguageProvider>
            <Router>
                <AppRouter />
            </Router>
        </LanguageProvider>
    );
}

export default App;
