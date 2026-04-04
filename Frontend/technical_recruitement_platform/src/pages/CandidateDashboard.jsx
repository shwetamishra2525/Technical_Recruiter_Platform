import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { UploadCloud, Play, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
    const userEmail = localStorage.getItem('user_email') || 'Candidate';
    const userName = userEmail.split('@')[0];

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [jds, setJds] = useState([]); // Fetch available jobs
    const [modalData, setModalData] = useState({ open: false, title: '', message: '', type: 'success' });
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const savedProfile = sessionStorage.getItem('candidate_profile');
        const savedJds = sessionStorage.getItem('candidate_jds');
        
        if (savedProfile && savedJds) {
            setProfile(JSON.parse(savedProfile));
            setJds(JSON.parse(savedJds));
        }
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/candidate/jobs');
            return res.data;
        } catch (err) {
            console.error("Error fetching jobs:", err);
            return [];
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setProfile(null);
        setJds([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload and parse resume
            const res = await api.post('/candidate/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // 2. Fetch fresh JDs using the newly uploaded resume
            // Wait for this BEFORE updating any UI state
            const jobsData = await fetchJobs();

            // 3. Update both at once and persistence
            const profileData = res.data.data;
            setProfile(profileData);
            setJds(jobsData);
            
            // Store for session persistence (prevent reset on back button)
            sessionStorage.setItem('candidate_profile', JSON.stringify(profileData));
            sessionStorage.setItem('candidate_jds', JSON.stringify(jobsData));

            setModalData({
                open: true,
                title: 'Success!',
                message: 'Resume Uploaded & Parsed Successfully.',
                type: 'success'
            });
        } catch (err) {
            console.error(err);
            setModalData({
                open: true,
                title: 'Upload Failed',
                message: err.response?.data?.detail || 'Failed to upload and parse resume.',
                type: 'error'
            });
        } finally {
            setUploading(false);
            // Intentionally keeping the attached file visible
        }
    };

    const startInterview = async (jdId) => {
        if (!profile) {
            setModalData({
                open: true,
                title: 'Action Required',
                message: 'Please upload your resume first to unlock the interview.',
                type: 'error'
            });
            return;
        }
        navigate(`/candidate/interview/${jdId}`);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col items-center">
            {/* Welcome Banner */}
            <div className="w-full max-w-2xl mb-12">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-lg shadow-gray-200/50 dark:shadow-none relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-colors" />
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20 ring-4 ring-teal-50 dark:ring-teal-900/30">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Empowering Your Career</p>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                            Welcome Back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 capitalize">{userName}</span>
                        </h1>
                    </div>

                </div>
            </div>

            <GlassCard className="w-full max-w-2xl text-center mb-8 bg-white dark:bg-slate-900/80 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100/50 dark:border-slate-800 transition-colors">
                <h1 className="text-3xl font-bold mb-4 text-teal-800 dark:text-teal-400">Candidate Profile</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your resume to get matched with jobs and start your AI interview.</p>

                <form onSubmit={handleUpload} className="flex flex-col items-center gap-4 border-2 border-dashed border-teal-200 dark:border-teal-900/50 rounded-xl p-8 bg-teal-50/50 dark:bg-teal-900/10 transition-colors">
                    <UploadCloud size={48} className="text-teal-500" />
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange} 
                        accept=".txt,.pdf,.docx" 
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-teal-50 dark:file:bg-teal-900/30 file:text-teal-700 dark:file:text-teal-400
              hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50 transition-colors
            " />
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="bg-teal-600 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 disabled:opacity-50 transition shadow-lg shadow-teal-500/20"
                    >
                        {uploading ? 'Analyzing...' : 'Upload & Analyze'}
                    </button>
                </form>

                {profile && (
                    <div className="mt-8 text-left bg-white/60 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Analysis Complete</h3>
                        <p className="text-slate-700 dark:text-slate-300 mt-2"><strong>Name:</strong> {profile.full_name}</p>
                        <p className="text-slate-700 dark:text-slate-300"><strong>Experience:</strong> {profile.experience_years} years</p>
                        <p className="text-slate-700 dark:text-slate-300"><strong>Skills:</strong> {profile.skills.join(', ')}</p>
                    </div>
                )}
            </GlassCard>

            {(profile) && (
                <GlassCard className="w-full max-w-2xl dark:bg-slate-900/60 dark:border-slate-800">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Recommended Positions</h2>
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-4"></div>
                            <p className="text-teal-600 font-medium">Finding best matches for your profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jds
                                .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
                                .map(job => (
                                    <div key={job.id} className={`p-5 rounded-xl border transition hover:shadow-lg ${job.match_score >= 70 ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-900/30' : 'bg-white/60 border-gray-100 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{job.title}</h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                                                    Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2 max-w-md">{job.skills.join(', ')}</p>

                                                {job.match_score > 0 && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${job.match_score >= 80 ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                                                job.match_score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                                                                }`}>
                                                                {job.match_score}% Match
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{job.match_reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => startInterview(job.id)}
                                                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-teal-500/20"
                                            >
                                                Start Interview
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </GlassCard>
            )}

            <GlassModal
                isOpen={modalData.open}
                onClose={() => setModalData({ ...modalData, open: false })}
                title={modalData.title}
            >
                <div className="text-center space-y-4">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${modalData.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {modalData.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <p className="text-gray-600">{modalData.message}</p>
                    <button
                        onClick={() => setModalData({ ...modalData, open: false })}
                        className={`w-full py-2 rounded-lg transition text-white ${modalData.type === 'success' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                        Close
                    </button>
                </div>
            </GlassModal>
        </div>
    );
};

export default CandidateDashboard;
