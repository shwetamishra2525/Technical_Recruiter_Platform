import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Edit3, Briefcase, Camera, Upload, CheckCircle, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Modal Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        phone: '',
        company_name: '',
        gender: '',
        location: '',
        dob: ''
    });
    
    // Photo Upload State
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) return navigate('/login');
            
            const res = await api.get('/user/profile');
            setProfileData(res.data);
            setEditForm({
                phone: res.data.user.phone || '',
                company_name: res.data.user.company_name || '',
                gender: res.data.user.gender || '',
                location: res.data.user.location || '',
                dob: res.data.user.dob || ''
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append("file", file);
        
        try {
            const res = await api.post('/user/upload-photo', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: { photo_url: res.data.photo_url } }));
            await fetchProfile(); // Refresh immediately
        } catch (error) {
            console.error("Photo upload failed", error);
            alert("Photo upload failed");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/user/update-profile', editForm);
            await fetchProfile();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Profile update failed", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                alert("Session expired. Please log in again.");
                navigate('/login');
            } else {
                alert("Update failed, please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-center dark:bg-slate-950 transition-colors">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-center dark:bg-slate-950 transition-colors">
                <GlassCard className="max-w-md w-full text-center space-y-6 py-12">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <User size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Authentication Required</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Please log in again to access your profile.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all uppercase tracking-wider"
                    >
                        Back to Login
                    </button>
                </GlassCard>
            </div>
        );
    }

    const { user, completion_percentage, history } = profileData;
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-12 px-4 transition-colors duration-300 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-6">
                
                {/* Horizontal Linear Progress Bar */}
                <GlassCard className="bg-white/70 dark:bg-slate-900/80 overflow-hidden dark:border-slate-800 transition-colors">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-white">Profile Completion</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Status: {completion_percentage === 100 ? 'Verified' : 'In Progress'}</p>
                        </div>
                        <span className={`text-3xl font-black ${user.role === 'hr' ? 'text-indigo-600' : 'text-teal-600'}`}>{completion_percentage}%</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completion_percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r shadow-[0_0_20px_rgba(0,0,0,0.2)] ${user.role === 'hr' ? 'from-indigo-500 to-purple-600 shadow-indigo-500/40' : 'from-teal-500 to-emerald-600 shadow-teal-500/40'}`}
                        />
                    </div>
                </GlassCard>

                {/* Main Profile Info */}
                <GlassCard className="bg-white/80 border-t-4 border-indigo-600 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Sparkles size={120} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            {user.photo_url ? (
                                <img src={user.photo_url} alt="Profile" className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-2xl transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-32 h-32 rounded-3xl bg-indigo-50 dark:bg-slate-800/50 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl">
                                    <User size={64} className="text-indigo-600/40" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className={`absolute -bottom-2 -right-2 p-2.5 text-white rounded-xl shadow-lg transition-colors ${user.role === 'hr' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                            >
                                <Camera size={18} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-3 justify-center md:justify-start">
                                {user.role === 'hr' ? user.email.split('@')[0] : 'Candidate'}
                                <span className={`${user.role === 'hr' ? 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20' : 'bg-teal-600/10 text-teal-600 border-teal-600/20'} text-xs px-3 py-1 rounded-full uppercase tracking-widest border`}>
                                    {user.role}
                                </span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 mb-6">{user.email}</p>
                            {/* Personal Details Form-Like View */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-gray-400">Phone Number</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.phone || '---'}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-gray-400">Gender</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.gender || '---'}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-gray-400">Date of Birth</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.dob || '---'}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-gray-400">Location</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.location || '---'}</span>
                                </div>
                                {user.role === 'hr' && (
                                    <div className="flex flex-col gap-1 p-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800 sm:col-span-2">
                                        <span className="text-xs font-bold text-gray-400">Company Name</span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.company_name || '---'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top-Right Edit Button */}
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className={`absolute top-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 text-white rounded-xl font-bold text-sm transition shadow-lg hover:scale-105 active:scale-95 ${user.role === 'hr' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'}`}
                        >
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    </div>
                </GlassCard>

                {/* Test/Activity History Section */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 ml-1">
                        {user.role === 'hr' ? 'Your Created Jobs & Applications' : 'Your Test History'}
                    </h3>
                    
                    {history.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900/80 rounded-xl p-8 border border-gray-100 dark:border-slate-800 text-center text-gray-500 dark:text-gray-400 shadow-sm transition-colors">
                            No active history found. Start your first {user.role === 'hr' ? 'job post' : 'interview session'} to see insights here!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item, index) => (
                                <GlassCard key={index} className="bg-white dark:bg-slate-900/80 hover:-translate-y-1 hover:shadow-xl transition-all border-l-4 border-indigo-600 dark:border-slate-800 p-5">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">{item.title}</h4>
                                    {user.role === 'candidate' ? (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`px-2 py-1 rounded-md capitalize font-medium ${item.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                                {item.status}
                                            </span>
                                            {item.status === 'completed' && <strong className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">Score: {item.score}/10</strong>}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Total Applicants:</span>
                                            <strong className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">{item.applicants}</strong>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-4 text-right">
                                        {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <GlassModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit My Profile"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <p className="text-sm text-gray-500 text-center -mt-2 mb-4">You can update your profile photo by clicking on it in the main dashboard.</p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+1 234 567 890"
                            className={`w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors focus:ring-2 ${user.role === 'hr' ? 'focus:ring-indigo-500' : 'focus:ring-teal-500'}`}
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                            <select
                                className={`w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-100 rounded-lg outline-none transition-colors focus:ring-2 ${user.role === 'hr' ? 'focus:ring-indigo-500' : 'focus:ring-teal-500'}`}
                                value={editForm.gender}
                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                className={`w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-100 rounded-lg outline-none transition-colors focus:ring-2 ${user.role === 'hr' ? 'focus:ring-indigo-500' : 'focus:ring-teal-500'}`}
                                value={editForm.dob}
                                onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <input
                            type="text"
                            placeholder="City, Country"
                            className={`w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors focus:ring-2 ${user.role === 'hr' ? 'focus:ring-indigo-500' : 'focus:ring-teal-500'}`}
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        />
                    </div>

                    {user?.role === 'hr' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                            <input
                                type="text"
                                placeholder="Your Company Ltd"
                                className={`w-full p-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-lg outline-none transition-colors focus:ring-2 ${user.role === 'hr' ? 'focus:ring-indigo-500' : 'focus:ring-teal-500'}`}
                                value={editForm.company_name}
                                onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full mt-2 py-3 text-white rounded-lg font-medium transition shadow-sm ${user.role === 'hr' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}
                    >
                        Save Improvements
                    </button>
                </form>
            </GlassModal>
        </div>
    );
};

export default ProfilePage;
