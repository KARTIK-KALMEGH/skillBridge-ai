import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Internship } from '../types';
import { collection, query, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, IndianRupee, Clock, Search, Filter, Plus, X, Building } from 'lucide-react';

interface InternshipsProps {
  user: User;
  profile: UserProfile;
}

export default function Internships({ user, profile }: InternshipsProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInternship, setNewInternship] = useState({
    title: '',
    company: '',
    description: '',
    stipend: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      fetchInternships();
    }
  }, [user]);

  const fetchInternships = async () => {
    setLoading(true);
    const path = 'internships';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Internship));
      setInternships(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = 'internships';
    try {
      const internshipData: Internship = {
        ...newInternship,
        postedBy: user.uid,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, path), internshipData);
      setShowAddModal(false);
      setNewInternship({ title: '', company: '', description: '', stipend: '', location: '' });
      fetchInternships();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Internship Marketplace
          </h1>
          <p className="text-slate-600">Find real-world projects and internships that match your skills.</p>
        </div>
        {(profile.role === 'recruiter' || profile.role === 'admin') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Post Internship
          </button>
        )}
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by role, company or skills..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-600 outline-none transition-all bg-white"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 animate-pulse bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((job, i) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <Building className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">New</div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-all">{job.title}</h3>
              <div className="text-slate-500 font-medium mb-6">{job.company}</div>

              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                  {job.stipend} / month
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Full-time
                </div>
              </div>

              <button className="mt-auto w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all">
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Internship Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Post New Internship</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddInternship} className="p-8 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                  <input 
                    required
                    type="text"
                    value={newInternship.title}
                    onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                    placeholder="e.g. Frontend Developer Intern"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                  <input 
                    required
                    type="text"
                    value={newInternship.company}
                    onChange={(e) => setNewInternship({...newInternship, company: e.target.value})}
                    placeholder="e.g. SkillBridge AI"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Stipend (₹)</label>
                    <input 
                      required
                      type="text"
                      value={newInternship.stipend}
                      onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                      placeholder="e.g. 15,000"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                    <input 
                      required
                      type="text"
                      value={newInternship.location}
                      onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                      placeholder="e.g. Remote / Mumbai"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={newInternship.description}
                    onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                    placeholder="Describe the role and requirements..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all mt-4"
                >
                  Post Opportunity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
