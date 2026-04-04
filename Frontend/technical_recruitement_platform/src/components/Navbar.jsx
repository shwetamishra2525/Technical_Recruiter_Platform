import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FilePlus, User, Sparkles, Moon, Sun, Code2 } from 'lucide-react';
import GlassModal from './GlassModal';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        let isMounted = true;
        if (token) {
            const fetchPhoto = async () => {
                try {
                    const res = await api.get('/user/profile-status');
                    if (isMounted) {
                        setPhotoUrl(res.data?.user_details?.photo_url || null);
                    }
                } catch (err) {
                    console.error("Failed to load profile photo", err);
                    if (isMounted) setPhotoUrl(null);
                }
            };
            fetchPhoto();

            const handlePhotoUpdate = (e) => {
                if (e.detail?.photo_url) {
                    setPhotoUrl(e.detail.photo_url);
                }
            };
            window.addEventListener('profilePhotoUpdated', handlePhotoUpdate);
            return () => {
                isMounted = false;
                window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate);
            };
        }
    }, [token, location.pathname]);

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('candidate_profile');
        sessionStorage.removeItem('candidate_jds');
        setShowLogoutModal(false);
        navigate('/login');
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    if (['/login', '/register'].includes(location.pathname)) return null;
    if (!token) return null;

    return (
        <>
            <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center border-b border-white/20">
                <div
                    className="flex items-center gap-2 text-2xl font-black tracking-tighter cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md group-hover:scale-110 transition-transform">
                        <Code2 size={18} className="text-white" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                        AI Recruiter
                    </span>
                </div>
                <div className="flex gap-6 items-center">
                    {role === 'hr' ? (
                        <>
                            <Link to="/hr/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                <LayoutDashboard size={20} /> Dashboard
                            </Link>
                            <Link to="/hr/create-jd" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                <FilePlus size={20} /> New Job
                            </Link>
                        </>
                    ) : (
                        <Link to="/candidate/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                            <LayoutDashboard size={20} /> Dashboard
                        </Link>
                    )}
                    
                    <Link to="/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                            <User size={20} />
                        )}
                        <span className="font-medium">My Profile</span>
                    </Link>

                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition ml-2"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors ml-2"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <GlassModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
            >
                <div className="text-center space-y-6">
                    <p className="text-gray-600 text-lg">Are you sure you want to log out?</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogoutConfirm}
                            className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium shadow-lg shadow-red-200"
                        >
                            Yes, Logout
                        </button>
                    </div>
                </div>
            </GlassModal>
        </>
    );
};

export default Navbar;
