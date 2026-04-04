import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { FileText, List, CheckCircle, Copy, UploadCloud } from 'lucide-react';

const JDCreator = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState({ open: false, title: '', message: '', id: null, success: false });
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post('/hr/upload-jd', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("Upload response:", res.data);

            // Show success modal
            setModalData({
                open: true,
                title: 'Job Description Created!',
                message: `Successfully extracted details for "${res.data.title}".`,
                id: res.data._id || res.data.id,
                success: true
            });
        } catch (err) {
            console.error("Upload error:", err);
            setModalData({
                open: true,
                title: 'Upload Failed',
                message: err.response?.data?.detail || 'Failed to process job description.',
                id: null,
                success: false
            });
        } finally {
            setLoading(false);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const copyToClipboard = () => {
        if (modalData.id) {
            navigator.clipboard.writeText(modalData.id);
            // Could add a small toast state here, but alert is fine for simple copy
            alert("Copied ID!");
        }
    };

    const handleModalClose = () => {
        setModalData({ ...modalData, open: false });
        if (modalData.success) {
            navigate('/hr/dashboard');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 flex justify-center">
            <GlassCard className="w-full max-w-2xl bg-white/70">
                <h1 className="text-3xl font-bold mb-6 text-indigo-900 flex items-center gap-3">
                    <FileText className="text-indigo-600" /> Create New Job
                </h1>

                <div className="mt-8">
                    {/* Upload Section */}
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white/50 border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition cursor-pointer relative group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.txt,.docx"
                                onChange={handleFileSelect}
                                disabled={loading}
                            />

                            <div className="flex justify-center mb-4">
                                <div className={`p-4 rounded-full ${file ? 'bg-indigo-100' : 'bg-gray-100'} group-hover:scale-110 transition-transform`}>
                                    <UploadCloud size={32} className={file ? 'text-indigo-600' : 'text-gray-400'} />
                                </div>
                            </div>

                            {file ? (
                                <div>
                                    <p className="text-lg font-medium text-gray-800 mb-1">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg font-medium text-gray-800 mb-2">
                                        Drag & drop your Job Description here
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Supports PDF, TXT, DOCX up to 5MB
                                    </p>
                                    <span className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                                        Browse Files
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-medium text-white shadow-lg transition flex items-center justify-center gap-2
                                ${!file || loading
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing Document...</span>
                                </>
                            ) : (
                                <>
                                    <span>Upload & Extract Details</span>
                                    <CheckCircle size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </GlassCard>

            <GlassModal
                isOpen={modalData.open}
                onClose={handleModalClose}
                title={modalData.title}
            >
                <div className="text-center space-y-4">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${modalData.id ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {modalData.id ? <CheckCircle size={24} /> : <FileText size={24} />}
                    </div>
                    <p className="text-gray-600">{modalData.message}</p>

                    {modalData.id && (
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                            <code className="text-sm font-mono text-gray-700">{modalData.id}</code>
                            <button onClick={copyToClipboard} className="text-indigo-600 hover:text-indigo-800 p-2">
                                <Copy size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleModalClose}
                        className={`w-full py-2 rounded-lg transition text-white ${modalData.success ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                        {modalData.success ? 'View Dashboard' : 'Close'}
                    </button>
                </div>
            </GlassModal>
        </div>
    );
};

export default JDCreator;
