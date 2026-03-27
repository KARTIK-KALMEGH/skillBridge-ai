import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Mentor from './pages/Mentor';
import Roadmap from './pages/Roadmap';
import Internships from './pages/Internships';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // New user, will need onboarding
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar user={user} profile={profile} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} profile={profile} />} />
            <Route 
              path="/onboarding" 
              element={user ? <Onboarding user={user} onComplete={(p) => setProfile(p)} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={user && profile ? <Dashboard user={user} profile={profile} /> : <Navigate to={user ? "/onboarding" : "/"} />} 
            />
            <Route 
              path="/mentor" 
              element={user && profile ? <Mentor user={user} profile={profile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/roadmap" 
              element={user && profile ? <Roadmap user={user} profile={profile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/internships" 
              element={user && profile ? <Internships user={user} profile={profile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={user && profile ? <Profile user={user} profile={profile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/assessment" 
              element={user && profile ? <Assessment user={user} profile={profile} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/projects" 
              element={user && profile ? <Projects user={user} profile={profile} /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
