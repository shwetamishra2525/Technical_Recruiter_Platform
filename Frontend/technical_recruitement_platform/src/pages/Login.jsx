import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, ArrowRight, Code2, Brain, Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (localStorage.getItem('token')) {
            const role = localStorage.getItem('role');
            if (role === 'hr') navigate('/hr/dashboard');
            else navigate('/candidate/dashboard');
        }
    }, [navigate]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', data);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('user_email', data.email);

            if (response.data.role === 'hr') {
                navigate('/hr/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Left Panel - Hero/Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900 border-r border-slate-200">
                {/* Background Image & Overlays */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2070&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/40" />
                <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Logo Area */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex items-center gap-3"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Code2 className="text-white" size={24} />
                    </div>
                    <span className="text-white font-black text-2xl tracking-tight">TechRecruit<span className="text-indigo-400">.</span></span>
                </motion.div>

                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-xl pb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                        <Brain size={12} /> AI-Powered Hiring
                    </div>
                    <h2 className="text-5xl xl:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Shape the <br />Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400">
                            Tech Teams.
                        </span>
                    </h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-md">
                        Connect with top-tier engineering talent using advanced code analysis and interactive AI assessments.
                    </p>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute bottom-12 right-12 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />
                    <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full" />
                </div>
            </div>

            {/* Right Panel - Form (Full width on mobile) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-950 p-6 lg:p-12 transition-colors">
                {/* Subtle Light Mesh Background */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md z-10"
                >
                    {/* Mobile Logo Logo (Visible only on mobile) */}
                    <div className="flex lg:hidden justify-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Code2 className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">Welcome Back</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Please enter your details to sign in.</p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 relative w-full">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3 font-medium"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        {...register('email', { required: 'Email is required' })}
                                        type="email"
                                        autoComplete="off"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                                        placeholder="xyz@gmail.com"
                                    />
                                </div>
                                {errors.email && <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                                    <a href="#" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        {...register('password', { required: 'Password is required' })}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.password.message}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group overflow-hidden text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            Authenticating
                                            <Sparkles className="animate-spin text-indigo-200" size={18} />
                                        </>
                                    ) : (
                                        <>
                                            Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-400 font-bold transition-colors">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

