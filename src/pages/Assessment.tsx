import { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Badge } from '../types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Award, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssessmentProps {
  user: User;
  profile: UserProfile;
}

export default function Assessment({ user, profile }: AssessmentProps) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const questions = [
    {
      q: "Which of the following is a core principle of React?",
      options: ["Two-way data binding", "Component-based architecture", "Direct DOM manipulation", "Global state by default"],
      a: 1
    },
    {
      q: "What is the purpose of the 'useEffect' hook?",
      options: ["To manage local state", "To handle side effects", "To create new components", "To optimize rendering"],
      a: 1
    },
    {
      q: "What does JSX stand for?",
      options: ["JavaScript XML", "Java Syntax Extension", "JSON Syntax XML", "JavaScript X-platform"],
      a: 0
    }
  ];

  const handleAnswer = (index: number) => {
    if (index === questions[currentQuestion].a) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep('result');
    }
  };

  const claimBadge = async () => {
    setLoading(true);
    const path = `users/${user.uid}`;
    try {
      const newBadge: Badge = {
        id: 'react-dev-foundation',
        name: 'React Foundations',
        issuedAt: new Date().toISOString(),
        icon: 'Award'
      };

      await updateDoc(doc(db, 'users', user.uid), {
        badges: arrayUnion(newBadge)
      });
      
      navigate('/profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-8">
              <Target className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Skill Verification: React</h1>
            <p className="text-slate-600 text-lg mb-8">Complete this assessment to earn your <span className="font-bold text-indigo-600">React Foundations</span> badge and showcase it on your profile.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">3 Questions</div>
                <div className="text-xs text-slate-500 uppercase">Multiple Choice</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">5 Minutes</div>
                <div className="text-xs text-slate-500 uppercase">Time Limit</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">80% Score</div>
                <div className="text-xs text-slate-500 uppercase">To Pass</div>
              </div>
            </div>

            <button 
              onClick={() => setStep('quiz')}
              className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto shadow-xl shadow-indigo-100"
            >
              Start Assessment <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</div>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-12">{questions[currentQuestion].q}</h2>

            <div className="grid grid-cols-1 gap-4">
              {questions[currentQuestion].options.map((option, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-slate-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center"
          >
            {score >= 2 ? (
              <>
                <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Assessment Passed!</h2>
                <p className="text-slate-600 mb-12 text-lg">You scored {score}/{questions.length}. You've earned the <span className="font-bold text-indigo-600">React Foundations</span> badge.</p>
                
                <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 mb-12 inline-block">
                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
                    <Award className="w-10 h-10" />
                  </div>
                  <div className="font-bold text-indigo-900 text-xl">React Foundations</div>
                  <div className="text-indigo-600 text-sm font-medium">SkillBridge Verified</div>
                </div>

                <button 
                  onClick={claimBadge}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  Claim & Add to Profile
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-8">
                  <Target className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Keep Learning!</h2>
                <p className="text-slate-600 mb-12 text-lg">You scored {score}/{questions.length}. You need at least 2 correct answers to earn the badge.</p>
                
                <button 
                  onClick={() => {
                    setStep('intro');
                    setCurrentQuestion(0);
                    setScore(0);
                  }}
                  className="w-full bg-slate-100 text-slate-700 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Try Again
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
