import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { LayoutDashboard, MessageSquare, Map, Briefcase, Code, User as UserIcon, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Sparkles className="w-6 h-6" />
          <span>SkillBridge AI</span>
        </Link>

        {user && profile && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/mentor" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>AI Mentor</span>
            </Link>
            <Link to="/roadmap" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              <Map className="w-4 h-4" />
              <span>Roadmap</span>
            </Link>
            <Link to="/internships" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              <Briefcase className="w-4 h-4" />
              <span>Internships</span>
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors font-medium">
              <Code className="w-4 h-4" />
              <span>Projects</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-colors">
                <UserIcon className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-slate-500 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/" 
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
