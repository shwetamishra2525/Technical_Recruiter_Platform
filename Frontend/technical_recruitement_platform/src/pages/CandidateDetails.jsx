import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { User, Code, FileText, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const CandidateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ open: false, title: '', message: '' });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/hr/interview/${id}`);
                setCandidate(res.data);
            } catch (err) {
                console.error("Error fetching details:", err);
                alert("Failed to load interview details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            await api.post(`/hr/update-status/${id}`, { status: newStatus });

            setModalData({
                open: true,
                title: 'Status Updated',
                message: `Application has been marked as: ${newStatus}`
            });

            // Optimistically update
            setCandidate(prev => ({
                ...prev,
                interview: { ...prev.interview, status: newStatus }
            }));
        } catch (err) {
            console.error("Update failed:", err);
            setModalData({
                open: true,
                title: 'Error',
                message: 'Could not update status. Please try again.'
            });
        }
    };

    if (loading) return <div className="text-center pt-24">Loading details...</div>;
    if (!candidate) return <div className="text-center pt-24">Candidate not found.</div>;

    const { profile, interview } = candidate;
    const isFinalized = interview.status === 'Approved' || interview.status === 'Reject';

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-gray-50 flex flex-col items-center">
            <GlassCard className="w-full max-w-4xl mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <User className="text-indigo-600" />
                            {profile.full_name || "Unknown Candidate"}
                        </h1>
                        <p className="text-gray-500 mt-2">{profile.email}</p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase mb-2 ${interview.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            interview.status === 'Reject' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {interview.status}
                        </span>
                        <p className="font-semibold text-gray-700">Score: {interview.total_score.toFixed(1)} / 10</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-white/50 rounded-lg border border-gray-100">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                            <Code size={18} /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg border border-gray-100">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                            <FileText size={18} /> Experience
                        </h3>
                        <p>{profile.experience_years} Years</p>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-4 border-t pt-6">
                    <button
                        onClick={() => updateStatus('Approved')}
                        disabled={isFinalized}
                        className={`flex-1 py-2 rounded-lg transition flex justify-center items-center gap-2 ${isFinalized
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        <CheckCircle size={18} /> Approve Candidate
                    </button>
                    <button
                        onClick={() => updateStatus('Reject')}
                        disabled={isFinalized}
                        className={`flex-1 py-2 rounded-lg transition flex justify-center items-center gap-2 ${isFinalized
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        <XCircle size={18} /> Reject Candidate
                    </button>
                    <button
                        onClick={() => navigate('/hr/dashboard')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>
            </GlassCard>

            {/* Questions & Answers */}
            <GlassCard className="w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Interview Responses</h2>
                {interview.questions && interview.questions.length > 0 ? (
                    <div className="space-y-6">
                        {interview.questions.map((q, idx) => (
                            <div key={idx} className="p-4 bg-white/60 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-800">Q{idx + 1}: {q.question}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${q.score >= 7 ? 'bg-green-100 text-green-700' :
                                        q.score >= 4 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        Score: {q.score}/10
                                    </span>
                                </div>
                                <div className="pl-4 border-l-4 border-indigo-200 my-3">
                                    <p className="text-gray-600 italic">"{q.answer || "No answer provided"}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No interview data available yet.</p>
                )}
            </GlassCard>

            <GlassModal
                isOpen={modalData.open}
                onClose={() => setModalData({ ...modalData, open: false })}
                title={modalData.title}
            >
                <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <p className="text-gray-600">{modalData.message}</p>
                    <button
                        onClick={() => setModalData({ ...modalData, open: false })}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </GlassModal>
        </div>
    );
};

export default CandidateDetails;
