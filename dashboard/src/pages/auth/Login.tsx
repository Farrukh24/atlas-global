import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import { Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data.data;
            setAuth(token, user);
            toast.success('Welcome back, ' + user.legal_name);
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
            {/* Cosmic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            {/* Stars/Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: Math.random(), scale: Math.random() }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1],
                        y: [0, -20, 0]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                    className="absolute bg-white rounded-full blur-[1px] z-[1]"
                    style={{
                        width: Math.random() * 3 + 'px',
                        height: Math.random() * 3 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                    }}
                />
            ))}

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg z-10"
            >
                <div className="glass-panel p-10 rounded-[40px] shadow-2xl relative border border-white/10">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-primary-600/50">
                        <span className="text-4xl font-black text-white -rotate-12 tracking-tighter">A</span>
                    </div>

                    <div className="text-center mt-8 mb-10">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Welcome Back</h2>
                        <p className="text-gray-400 font-medium">Atlas Global Logistics Command Center</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-primary-500">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[22px] focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-white placeholder-gray-600 font-medium"
                                    placeholder="name@atlas.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-primary-500">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[22px] focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-white placeholder-gray-600 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="hidden"
                                />
                                <div className={cn(
                                    "w-5 h-5 rounded-md border border-white/20 mr-3 flex items-center justify-center transition-all",
                                    rememberMe ? "bg-primary-600 border-primary-600" : "bg-white/5 group-hover:border-primary-500"
                                )}>
                                    {rememberMe && <ArrowRight size={14} className="text-white rotate-[-45deg]" />}
                                </div>
                                <span className="text-sm font-bold text-gray-400">Remember me</span>
                            </label>
                            <Link to="/forgot-password" title="Forgot Password?" className="text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors">Forgot Password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[22px] shadow-2xl shadow-primary-600/30 transition-all flex items-center justify-center disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 flex items-center justify-center space-x-6 grayscale opacity-50">
                        <Github size={24} className="text-white" />
                        <div className="w-px h-6 bg-white/20" />
                        <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Secured by Atlas Auth</span>
                    </div>
                </div>

                <p className="mt-10 text-center text-gray-500 font-bold">
                    New to the network?{' '}
                    <Link to="/register" className="text-primary-500 font-black hover:underline underline-offset-4">Apply for Access</Link>
                </p>
            </motion.div>
        </div>
    );
}
