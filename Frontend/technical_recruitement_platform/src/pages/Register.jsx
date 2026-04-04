import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, User, ShieldCheck, UserPlus, Code2, Rocket, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import GlassModal from '../components/GlassModal';

const Register = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('candidate');
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        reset(); // Force clear on mount
        if (localStorage.getItem('token')) {
            const role = localStorage.getItem('role');
            if (role === 'hr') navigate('/hr/dashboard');
            else navigate('/candidate/dashboard');
        }
    }, [navigate, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const payload = { ...data, role };
            await api.post('/auth/signup', payload);
            reset(); // Clear form data
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.response?.data?.detail || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Left Panel - Hero/Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                {/* Background Image & Overlays */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=2069&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/40" />
                <div className="absolute inset-0 bg-indigo-600/20 mix-blend-multiply" />
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
                    <span className="text-white font-black text-2xl tracking-tight">TechRecruit<span className="text-indigo-500">.</span></span>
                </motion.div>

                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 max-w-xl pb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                        <Rocket size={12} /> Launch Your Journey
                    </div>
                    <h2 className="text-5xl xl:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Join the <br />Network of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400">
                            Innovators.
                        </span>
                    </h2>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-md">
                        Whether you're building the next big thing or looking to join a visionary team, your next chapter starts here.
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
                {/* Mesh Gradient Background for Form Side */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md z-10"
                >
                    {/* Mobile Logo (Visible only on mobile) */}
                    <div className="flex lg:hidden justify-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Code2 className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Join the next generation of recruitment technology.</p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 relative">
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

                        {/* Role Toggle */}
                        <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 rounded-2xl p-1.5 mb-8 border border-slate-200 dark:border-slate-800 relative">
                            {/* Sliding Background */}
                            <motion.div
                                animate={{ x: role === 'candidate' ? '0%' : '100%' }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl shadow-md bg-indigo-600 active:scale-95 transition-transform"
                            />

                            <button
                                type="button"
                                onClick={() => setRole('candidate')}
                                className={clsx(
                                    "relative flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors z-10",
                                    role === 'candidate' ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <User size={16} /> Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('hr')}
                                className={clsx(
                                    "relative flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors z-10",
                                    role === 'hr' ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <ShieldCheck size={16} /> Recruiter
                            </button>
                        </div>

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
                                        placeholder="your@email.com"
                                    />
                                </div>
                                {errors.email && <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider ml-1">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
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
                                    {loading ? 'Processing...' : (
                                        <>
                                            Get Started <UserPlus size={18} />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <GlassModal
                isOpen={showSuccessModal}
                onClose={handleCloseSuccessModal}
                title="Registration Successful!"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white text-center mb-2">Success!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Your account has been created successfully. You can now log in.</p>
                    <button
                        onClick={handleCloseSuccessModal}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all font-bold uppercase tracking-wider"
                    >
                        Proceed to Login
                    </button>
                </div>
            </GlassModal>
        </div>
    );
};

export default Register;
