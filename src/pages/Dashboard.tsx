import { User } from 'firebase/auth';
import { UserProfile, SkillRoadmap } from '../types';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion } from 'motion/react';
import { TrendingUp, Award, BookOpen, Briefcase, ChevronRight, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  profile: UserProfile;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [roadmaps, setRoadmaps] = useState<SkillRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      const path = 'roadmaps';
      try {
        const q = query(
          collection(db, path), 
          where('uid', '==', user.uid),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SkillRoadmap));
        setRoadmaps(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchRoadmaps();
    }
  }, [user.uid]);

  const stats = [
    { label: 'Skill Score', value: '78%', icon: <TrendingUp className="w-5 h-5 text-indigo-600" />, color: 'bg-indigo-50' },
    { label: 'Courses Done', value: '12', icon: <BookOpen className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50' },
    { label: 'Badges Earned', value: '4', icon: <Award className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Applied Jobs', value: '8', icon: <Briefcase className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.displayName}! 👋</h1>
          <p className="text-slate-600">Track your progress and continue your learning journey.</p>
        </div>
        <Link 
          to="/mentor"
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Sparkles className="w-5 h-5" />
          Ask AI Mentor
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Roadmap */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Active Learning Roadmap
              </h2>
              <Link to="/roadmap" className="text-indigo-600 font-bold text-sm hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="h-40 animate-pulse bg-slate-50 rounded-2xl"></div>
            ) : roadmaps.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-1">Goal: {roadmaps[0].goal}</h3>
                  <p className="text-indigo-700 text-sm">You are currently in Month 1 of your 3-month plan.</p>
                </div>
                <div className="flex flex-col gap-4">
                  {roadmaps[0].steps[0].topics.slice(0, 3).map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</div>
                        <span className="font-medium text-slate-700">{topic}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-6">You don't have an active roadmap yet.</p>
                <Link to="/roadmap" className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Skill Gap Analysis
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Current Progress towards {profile.careerGoal}</span>
                <span className="font-bold text-indigo-600">65%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                You're doing great! Focus on <span className="font-bold text-slate-700">System Design</span> and <span className="font-bold text-slate-700">Advanced React Patterns</span> to reach your goal.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Recommended Internships */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Recommended Jobs</h2>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Frontend Intern', company: 'TechFlow', stipend: '₹15,000' },
                { title: 'React Developer', company: 'StartupX', stipend: '₹25,000' },
                { title: 'UI Developer', company: 'DesignCo', stipend: '₹12,000' },
              ].map((job, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="font-bold text-slate-900">{job.title}</div>
                  <div className="text-sm text-slate-500 mb-2">{job.company}</div>
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded-md">{job.stipend}/mo</div>
                </div>
              ))}
            </div>
            <Link to="/internships" className="block text-center mt-6 text-indigo-600 font-bold text-sm hover:underline">View All Jobs</Link>
          </div>

          {/* Mentor Sessions */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-lg shadow-indigo-100">
            <h2 className="text-xl font-bold mb-4">Book a Mentor</h2>
            <p className="text-indigo-100 text-sm mb-6">Get 1-on-1 guidance from industry experts to accelerate your career.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all">
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
