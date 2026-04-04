import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { Mic, Send, Volume2, Loader2, Star, Play, CheckCircle, Clock, Brain, Keyboard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const InterviewRoom = () => {
    const { jdId } = useParams();
    const navigate = useNavigate();

    // State Machine
    const [viewState, setViewState] = useState('START_SCREEN');

    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [allAnswers, setAllAnswers] = useState([]);
    const [listening, setListening] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(600); // 10 minutes default
    const [submitting, setSubmitting] = useState(false);
    const [loadingText, setLoadingText] = useState('Initializing interview environment...');

    useEffect(() => {
        if (!loading) return;
        const texts = [
            "Analyzing profile and role requirements...",
            "Structuring interview parameters...",
            "Synthesizing domain-specific questions...",
            "Finalizing assessment criteria...",
            "Securing virtual room..."
        ];
        let i = 0;
        const textInterval = setInterval(() => {
            i = (i + 1) % texts.length;
            setLoadingText(texts[i]);
        }, 2200);
        return () => clearInterval(textInterval);
    }, [loading]);

    // Audio Visualizer Refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Speech Recognition
    const recognitionRef = useRef(null);

    // Ref to prevent double-firing in StrictMode
    const hasStartedRef = useRef(false);
    
    // Error Modal State
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });

    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        const startInterview = async () => {
            try {
                const res = await api.post(`/candidate/start-interview/${jdId}`);
                setInterviewId(res.data.interview_id);
                setQuestions(res.data.questions);
            } catch (err) {
                console.error("Failed to start interview", err);
                const errorMsg = err.response?.data?.detail || "Could not start interview.";
                setErrorModal({ open: true, message: errorMsg });
            } finally {
                setLoading(false);
            }
        };
        startInterview();

        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setAnswer(prev => prev + " " + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                if (listening) recognitionRef.current.start();
            };
        }

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [jdId, navigate]);

    // Timer Logic
    useEffect(() => {
        let interval = null;
        if (viewState === 'QUESTION_DISPLAY' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer <= 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [viewState, timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Visualizer Logic
    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64; // Small size for simple bars
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            drawVisualizer();
        } catch (err) {
            console.error("Audio Access Error:", err);
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / dataArrayRef.current.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArrayRef.current.length; i++) {
            const barHeight = dataArrayRef.current[i] / 2;

            // Gradient Color
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#4f46e5'); // Indigo
            gradient.addColorStop(1, '#a855f7'); // Purple

            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        animationFrameRef.current = requestAnimationFrame(drawVisualizer);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Browser not supported");

        if (listening) {
            recognitionRef.current.stop();
            // Stop Visualizer
            cancelAnimationFrame(animationFrameRef.current);
            setListening(false);
        } else {
            recognitionRef.current.start();
            startVisualizer();
            setListening(true);
        }
    };

    const handleStart = () => {
        setViewState('QUESTION_DISPLAY');
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;

        if (listening) toggleListening(); // Stop mic

        const updatedAnswers = [...allAnswers, answer];
        setAllAnswers(updatedAnswers);

        if (currentQuestionIndex === questions.length - 1) {
            setSubmitting(true);
            try {
                // Submit all answers at once
                await api.post(`/candidate/submit-all-answers/${interviewId}`, {
                    answers: updatedAnswers
                });
                // Clear session storage so dashboard resets for the next application
                sessionStorage.removeItem('candidate_profile');
                sessionStorage.removeItem('candidate_jds');
                
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                setViewState('COMPLETION');
            } catch (err) {
                console.error(err);
                alert("Submission Failed");
            } finally {
                setSubmitting(false);
            }
        } else {
            // Move to next question instantly
            setAnswer('');
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    // Handle Error State first so it doesn't get unmounted by loading=false
    if (errorModal.open) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex items-center justify-center p-6">
                <GlassModal 
                    isOpen={true} 
                    onClose={() => navigate('/candidate/dashboard')} 
                    title="Application Error"
                    maxWidth="max-w-md"
                >
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
                            {errorModal.message}
                        </p>
                        <div className="pt-4 flex justify-center">
                            <button 
                                onClick={() => navigate('/candidate/dashboard')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-600/30"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </GlassModal>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-slate-950 transition-colors">
            <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={64} />
            <p className="text-xl text-indigo-800 dark:text-indigo-200 font-medium tracking-wide animate-pulse min-h-[30px] transition-all">
                {loadingText}
            </p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">(This usually takes 10-15 seconds)</p>
        </div>
    );

    return (
        <div className="min-h-screen pt-16 pb-4 px-4 flex justify-center overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <GlassCard className="w-full max-w-4xl relative flex flex-col items-center justify-center text-center p-6 bg-white/40 dark:bg-slate-900/40 dark:border-slate-800">
                <AnimatePresence mode="wait">

                    {/* START SCREEN */}
                    {viewState === 'START_SCREEN' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-lg border border-indigo-600/20">
                                <Play size={40} fill="currentColor" />
                            </div>
                            <h1 className="text-4xl font-black text-gray-800 dark:text-white">AI Interview Session</h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                                5 questions. Real-time Analysis. Voice Enabled.
                            </p>
                            <button onClick={handleStart} className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1">
                                Start Now
                            </button>
                        </motion.div>
                    )}

                    {/* QUESTION SCREEN */}
                    {viewState === 'QUESTION_DISPLAY' && (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full text-left space-y-6"
                        >
                            {/* Header with Timer */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Time Remaining</p>
                                        <p className="text-2xl font-black text-gray-800 dark:text-white font-mono">{formatTime(timer)}</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-6 py-3 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`w-3 h-3 rounded-full ${i <= (currentQuestionIndex + 1) ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'bg-gray-100 dark:bg-slate-800'}`} />
                                            ))}
                                        </div>
                                        <span className="ml-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden mb-4 group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Brain size={160} className="text-indigo-600" />
                                </div>
                                <div className="relative z-10" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-50 mb-6">
                                        Active Question
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white leading-[1.5] max-w-2xl select-none">
                                        {typeof questions[currentQuestionIndex] === 'string' ? questions[currentQuestionIndex] : questions[currentQuestionIndex]?.question}
                                    </h2>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-24 p-5 rounded-[1.5rem] bg-gray-50/50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-700 focus:border-indigo-600/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-gray-700 dark:text-gray-200 font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none shadow-inner"
                                    placeholder="Type your answer here..."
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={submitting}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                     <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                        <Keyboard size={10} /> Live Input
                                     </div>
                                </div>

                                {/* Visualizer Canvas Overlay */}
                                {listening && (
                                    <div className="absolute bottom-4 right-4 w-32 h-16 pointer-events-none opacity-80">
                                        <canvas ref={canvasRef} width="128" height="64" className="w-full h-full"></canvas>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    onClick={toggleListening}
                                    className={`p-4 rounded-full transition-all shadow-lg ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50'}`}
                                >
                                    <Mic size={28} />
                                </button>

                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!answer.trim() || submitting}
                                    className={`px-10 py-4 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-2 group ${currentQuestionIndex === questions.length - 1 ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                    {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* COMPLETION SCREEN */}
                    {viewState === 'COMPLETION' && (
                        <motion.div
                            key="completion"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="w-28 h-28 bg-green-400 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                <CheckCircle size={64} />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">All Done!</h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300">Your profile has been updated and sent to HR.</p>
                            <button onClick={() => navigate('/candidate/dashboard')} className="mt-8 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-lg">
                                Back to Dashboard
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

export default InterviewRoom;
