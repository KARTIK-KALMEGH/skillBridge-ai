import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Briefcase, GraduationCap, Award, Settings, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User;
  profile: UserProfile;
}

export default function Profile({ user, profile }: ProfileProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Profile Header */}
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-100 flex items-center justify-center text-indigo-600">
          <UserIcon className="w-16 h-16" />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{profile.displayName}</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-wider border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{profile.role}</span>
            </div>
          </div>
          <p className="text-slate-500 text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-5 h-5" />
            {profile.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all">
              Edit Profile
            </button>
            <button className="bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
              Share Portfolio
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Career Info */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Career Goals
          </h2>
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Target Role</div>
              <div className="text-xl font-bold text-slate-800">{profile.careerGoal || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Interests</div>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg font-medium border border-slate-100">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Award className="w-6 h-6 text-purple-600" />
            Verified Badges
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 w-32">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-bold text-indigo-900 text-center leading-tight">{badge.name}</div>
                  <div className="text-[8px] text-indigo-600 uppercase tracking-tighter">Verified</div>
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-4">No badges earned yet.</p>
                <Link to="/assessment" className="text-indigo-600 font-bold text-sm hover:underline">Take Assessment</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
