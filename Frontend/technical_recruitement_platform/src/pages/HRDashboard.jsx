import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { Users, ClipboardList, TrendingUp, FileText, Trash2, Sparkles, AlertCircle, CheckCircle, Briefcase } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <GlassCard className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </GlassCard>
);

const HRDashboard = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('user_email') || 'Recruiter';
    const userName = userEmail.split('@')[0];

    const [stats, setStats] = useState({ total_applicants: 0, pending_reviews: 0, completion_rate: '0%' });
    const [candidates, setCandidates] = useState([]);
    const [jds, setJds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJd, setSelectedJd] = useState(null);
    const [isJdModalOpen, setIsJdModalOpen] = useState(false);
    const [isAllCandidatesModalOpen, setIsAllCandidatesModalOpen] = useState(false);

    // Deletion State
    const [deleteModalData, setDeleteModalData] = useState({ open: false, jdId: null, jdTitle: '', deleting: false });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/hr/dashboard');
            setStats(res.data.stats);
            setCandidates(res.data.candidates);
            if (res.data.jds) {
                setJds(res.data.jds);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const openJdDetails = (jd) => {
        setSelectedJd(jd);
        setIsJdModalOpen(true);
    };

    const handleDeleteClick = (e, jd) => {
        e.stopPropagation();
        setDeleteModalData({ open: true, jdId: jd.id, jdTitle: jd.title, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteModalData.jdId) return;
        setDeleteModalData(prev => ({ ...prev, deleting: true }));
        try {
            await api.delete(`/hr/job/${deleteModalData.jdId}`);
            setJds(prev => prev.filter(jd => jd.id !== deleteModalData.jdId));
            setDeleteModalData({ open: false, jdId: null, jdTitle: '', deleting: false });
        } catch (err) {
            console.error("Failed to delete JD:", err);
            alert("Failed to delete the Job Description.");
            setDeleteModalData(prev => ({ ...prev, deleting: false }));
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'reject': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-indigo-100 text-indigo-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

    const displayedCandidates = candidates.slice(0, 3);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Welcome Banner */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group mb-8 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50">
                    <Sparkles className="text-white" size={24} />
                </div>
                <div>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Talent Acquisition Portal</p>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                        Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 capitalize">{userName}</span>
                    </h1>
                </div>

            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Applicants"
                    value={stats.total_applicants}
                    icon={Users}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats.pending_reviews}
                    icon={ClipboardList}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Interview Completion"
                    value={stats.completion_rate}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                />
            </div>

            {/* Candidates Table */}
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/30 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Candidates</h2>
                    {candidates.length > 3 && (
                        <button
                            onClick={() => setIsAllCandidatesModalOpen(true)}
                            className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-all hover:translate-x-1 inline-flex items-center gap-1 cursor-pointer"
                        >
                            View More <span>→</span>
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Candidate Details</th>
                                <th className="px-6 py-4">Applied Role</th>
                                <th className="px-6 py-4">Result Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white/30 dark:bg-transparent">
                            {displayedCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No candidates found.
                                    </td>
                                </tr>
                            ) : (
                                displayedCandidates.map((candidate, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white ring-1 ring-indigo-50">
                                                    {candidate.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-none mb-1">{candidate.name}</span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight">Applied on {new Date(candidate.created_at || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-gray-600 dark:text-gray-300 font-semibold text-xs px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 shadow-sm">
                                                {candidate.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col flex-1 max-w-[100px]">
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                                        <div
                                                            className={`h-full rounded-full shadow-sm transition-all duration-1000 ${candidate.score >= 7 ? 'bg-emerald-500' : candidate.score >= 4 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${(candidate.score || 0) * 10}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className={`text-[13px] font-black tracking-tighter ${candidate.score >= 7 ? 'text-emerald-600' :
                                                    candidate.score >= 4 ? 'text-amber-600' :
                                                        'text-rose-600'
                                                    }`}>
                                                    {candidate.score?.toFixed(1) || '0.0'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`capitalize text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${getStatusStyle(candidate.status)}`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => navigate(`/hr/application/${candidate.id}`)}
                                                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white hover:border-indigo-600 dark:hover:border-indigo-600 transition-all duration-300 shadow-sm inline-flex items-center gap-2 group cursor-pointer"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for All Candidates */}
            <GlassModal
                isOpen={isAllCandidatesModalOpen}
                onClose={() => setIsAllCandidatesModalOpen(false)}
                title="Applied Candidates"
                maxWidth="max-w-4xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white/90 backdrop-blur z-10 text-gray-500 uppercase text-xs font-semibold border-b">
                            <tr>
                                <th className="py-3 px-2">Name</th>
                                <th className="py-3 px-2">Score</th>
                                <th className="py-3 px-2">Status</th>
                                <th className="py-3 px-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {candidates.map((candidate, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition">
                                    <td className="py-4 px-2 font-medium text-gray-800">{candidate.name}</td>
                                    <td className="py-4 px-2">
                                        <span className={`text-xs font-bold ${candidate.score >= 7 ? 'text-green-600' : candidate.score >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {candidate.score?.toFixed(1) || '0.0'}/10
                                        </span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${getStatusStyle(candidate.status)}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <button
                                            onClick={() => navigate(`/hr/application/${candidate.id}`)}
                                            className="px-3 py-1.5 rounded-lg border border-indigo-50 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-xs font-bold transition-all shadow-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => setIsAllCandidatesModalOpen(false)}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </GlassModal>

            {/* JDs Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 px-1">Posted Job Descriptions</h2>
                {jds.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={120} className="text-indigo-600" />
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">HR Commander Center</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your recruitment pipeline with AI precision.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jds.map((jd, idx) => (
                            <GlassCard key={idx} className="flex flex-col h-full relative group dark:bg-slate-900/60 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 pr-8 shadow-text">{jd.title}</h3>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, jd)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                        title="Delete Job Description"
                                    >
                                        <Trash2 size={18} className="cursor-pointer" />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                        {jd.requirements}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {jd.skills && jd.skills.slice(0, 4).map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                        {jd.skills && jd.skills.length > 4 && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                                                +{jd.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-gray-500 flex justify-between items-center">
                                    <span>Added {new Date(jd.created_at || Date.now()).toLocaleDateString()}</span>
                                    <button
                                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                                        onClick={() => openJdDetails(jd)}
                                    >
                                        View Full
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>

            {/* JD Details Modal */}
            <GlassModal
                isOpen={isJdModalOpen}
                onClose={() => setIsJdModalOpen(false)}
                title="Job Description Details"
            >
                {selectedJd && (
                    <div className="space-y-6 text-left max-h-[70vh] overflow-y-auto pr-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{selectedJd.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Posted on {new Date(selectedJd.created_at || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedJd.skills && selectedJd.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium border border-indigo-50">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Requirements / Summary</h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                {selectedJd.requirements}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end border-t border-gray-100 sticky bottom-0 bg-white/90 backdrop-blur pb-2">
                            <button
                                onClick={() => setIsJdModalOpen(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </GlassModal>

            {/* Delete Confirmation Modal */}
            < GlassModal
                isOpen={deleteModalData.open}
                onClose={() => !deleteModalData.deleting && setDeleteModalData({ ...deleteModalData, open: false })}
                title="Delete Job Description"
            >
                <div className="text-center space-y-6">
                    <p className="text-gray-600">
                        Are you sure you want to permanently delete <span className="font-bold text-gray-800">"{deleteModalData.jdTitle}"</span>?
                    </p>
                    <p className="text-sm text-red-500">This action cannot be undone.</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setDeleteModalData({ ...deleteModalData, open: false })}
                            disabled={deleteModalData.deleting}
                            className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteModalData.deleting}
                            className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium shadow-lg shadow-red-200 disabled:opacity-50 flex justify-center items-center"
                        >
                            {deleteModalData.deleting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </GlassModal>


        </div>
    );
};

export default HRDashboard;
