import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Briefcase, GraduationCap, Check, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'mentor' | 'recruiter'>('student');
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState('');
  const navigate = useNavigate();

  const commonInterests = [
    "Software Development", "Data Science", "Machine Learning", 
    "UI/UX Design", "Digital Marketing", "Product Management",
    "Cybersecurity", "Cloud Computing", "Blockchain"
  ];

  const handleToggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleComplete = async () => {
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'User',
      email: user.email || '',
      role,
      interests,
      careerGoal,
      createdAt: new Date().toISOString()
    };

    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete(profile);
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'
            }`}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Choose Your Role</h2>
          <p className="text-slate-600 mb-8">Select how you want to use SkillBridge AI.</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setRole('student')}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">Student / Graduate</div>
                <div className="text-slate-600 text-sm">I want to learn skills and find internships.</div>
              </div>
            </button>

            <button 
              onClick={() => setRole('mentor')}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                role === 'mentor' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">Industry Mentor</div>
                <div className="text-slate-600 text-sm">I want to guide students and share my expertise.</div>
              </div>
            </button>

            <button 
              onClick={() => setRole('recruiter')}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${
                role === 'recruiter' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">Recruiter</div>
                <div className="text-slate-600 text-sm">I want to find skilled talent for my company.</div>
              </div>
            </button>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            Next Step <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h2 className="text-3xl font-bold mb-2 text-slate-900">What are you interested in?</h2>
          <p className="text-slate-600 mb-8">Select at least 3 areas of interest.</p>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {commonInterests.map((interest) => (
              <button 
                key={interest}
                onClick={() => handleToggleInterest(interest)}
                className={`px-4 py-2 rounded-full border-2 transition-all font-medium ${
                  interests.includes(interest) 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
            >
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={interests.length < 1}
              className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Your Career Goal</h2>
          <p className="text-slate-600 mb-8">What job title are you aiming for?</p>
          
          <input 
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all mb-8 text-lg"
          />

          <div className="flex gap-4">
            <button 
              onClick={() => setStep(2)}
              className="flex-1 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
            >
              Back
            </button>
            <button 
              onClick={handleComplete}
              disabled={!careerGoal}
              className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Complete Setup <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
