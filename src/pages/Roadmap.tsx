import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, SkillRoadmap } from '../types';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { generateRoadmap } from '../services/gemini';
import { motion } from 'motion/react';
import { Map, Sparkles, Loader2, CheckCircle2, BookOpen, ExternalLink, Plus } from 'lucide-react';

interface RoadmapProps {
  user: User;
  profile: UserProfile;
}

export default function Roadmap({ user, profile }: RoadmapProps) {
  const [roadmaps, setRoadmaps] = useState<SkillRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRoadmaps();
    }
  }, [user.uid]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    const path = 'roadmaps';
    try {
      const q = query(collection(db, path), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillRoadmap));
      setRoadmaps(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const path = 'roadmaps';
    try {
      const steps = await generateRoadmap(profile.careerGoal || 'Software Developer', profile.interests || []);
      const newRoadmap: SkillRoadmap = {
        uid: user.uid,
        goal: profile.careerGoal || 'Software Developer',
        steps,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, path), newRoadmap);
      await fetchRoadmaps();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-600" />
            Your Learning Roadmaps
          </h1>
          <p className="text-slate-600">AI-generated step-by-step paths to reach your career goals.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Generate New Roadmap
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-64 animate-pulse bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"></div>)}
        </div>
      ) : roadmaps.length > 0 ? (
        <div className="flex flex-col gap-12">
          {roadmaps.map((roadmap, rIdx) => (
            <motion.div 
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rIdx * 0.1 }}
              className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">Active Roadmap</div>
                  <h2 className="text-3xl font-bold text-slate-900">{roadmap.goal}</h2>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-bold text-sm border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Progress</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connector Line */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
                
                {roadmap.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{step.month}</div>
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-100">
                        {sIdx + 1}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Key Topics
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {step.topics.map((topic, tIdx) => (
                          <li key={tIdx} className="text-sm text-slate-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        Resources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res, resIdx) => (
                          <span key={resIdx} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Map className="w-12 h-12" />
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">No Roadmaps Yet</h2>
            <p className="text-slate-600 text-lg">Generate your first AI-powered learning roadmap to start your journey towards your dream career.</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            Generate My Career Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
