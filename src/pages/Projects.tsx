import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, ProjectChallenge, ProjectSubmission } from '../types';
import { db } from '../firebase';
import { collection, query, getDocs, addDoc, where, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Code, ExternalLink, Github, Send, CheckCircle, AlertCircle, Loader2, Trophy, Lightbulb, Target } from 'lucide-react';
import { evaluateProject } from '../services/gemini';

interface ProjectsProps {
  user: User;
  profile: UserProfile;
}

const SAMPLE_CHALLENGES: ProjectChallenge[] = [
  {
    id: 'ch-1',
    title: 'Personal Finance Tracker',
    description: 'Build a full-stack application that helps users track their income and expenses. Include data visualization for monthly spending patterns.',
    requirements: [
      'User authentication (Firebase or similar)',
      'CRUD operations for transactions',
      'Dashboard with charts (Recharts or D3)',
      'Responsive design with Tailwind CSS',
      'State management (Context API or Redux)'
    ],
    difficulty: 'Intermediate',
    category: 'Full-stack',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch-2',
    title: 'AI Image Generator Interface',
    description: 'Create a modern, sleek UI for an AI image generation tool. Connect it to a mock or real API (like OpenAI DALL-E).',
    requirements: [
      'Modern, glassmorphism UI',
      'Image gallery with masonry layout',
      'Download and share functionality',
      'Loading states and skeleton screens',
      'Prompt history management'
    ],
    difficulty: 'Beginner',
    category: 'Frontend',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch-3',
    title: 'Real-time Collaborative Whiteboard',
    description: 'Develop a web application where multiple users can draw on a shared canvas in real-time.',
    requirements: [
      'Canvas API for drawing',
      'WebSockets (Socket.io or Firebase Realtime DB)',
      'Multiple brush sizes and colors',
      'Undo/Redo functionality',
      'Export as PNG/SVG'
    ],
    difficulty: 'Advanced',
    category: 'Real-time',
    createdAt: new Date().toISOString()
  }
];

export default function Projects({ user, profile }: ProjectsProps) {
  const [challenges, setChallenges] = useState<ProjectChallenge[]>(SAMPLE_CHALLENGES);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ProjectChallenge | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [user.uid]);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'submissions'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedSubmissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectSubmission[];
      setSubmissions(fetchedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    setIsSubmitting(true);
    try {
      // 1. Save submission to Firestore
      const submissionData = {
        challengeId: selectedChallenge.id,
        uid: user.uid,
        githubUrl,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'submissions'), submissionData);

      // 2. Trigger AI Evaluation
      const evaluation = await evaluateProject(selectedChallenge.title, { githubUrl, description });

      // 3. Update submission with evaluation
      await updateDoc(doc(db, 'submissions', docRef.id), {
        evaluation,
        status: 'evaluated'
      });

      // 4. Refresh submissions
      await fetchSubmissions();
      setSelectedChallenge(null);
      setGithubUrl('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionForChallenge = (challengeId: string) => {
    return submissions.find(s => s.challengeId === challengeId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Challenges</h1>
        <p className="text-xl text-gray-600">
          Build real-world projects, submit them for AI evaluation, and boost your portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => {
          const submission = getSubmissionForChallenge(challenge.id!);
          return (
            <motion.div
              key={challenge.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    challenge.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {challenge.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{challenge.description}</p>
                
                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" /> Key Requirements
                  </h4>
                  <ul className="space-y-1">
                    {challenge.requirements.slice(0, 3).map((req, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5" />
                        {req}
                      </li>
                    ))}
                    {challenge.requirements.length > 3 && (
                      <li className="text-xs text-gray-400 italic">+{challenge.requirements.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                {submission ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        submission.status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status === 'evaluated' ? 'Evaluated' : 'Pending Review'}
                      </span>
                    </div>
                    {submission.evaluation && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">AI Score</span>
                        <span className="text-lg font-bold text-indigo-600">{submission.evaluation.score}/100</span>
                      </div>
                    )}
                    <button 
                      onClick={() => setSelectedChallenge(challenge)}
                      className="w-full mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Start Challenge <Code className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-height-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedChallenge.title}</h2>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                        {selectedChallenge.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        {selectedChallenge.category}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" /> Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {selectedChallenge.description}
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" /> Requirements
                    </h3>
                    <ul className="space-y-2">
                      {selectedChallenge.requirements.map((req, i) => (
                        <li key={i} className="text-gray-600 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    {getSubmissionForChallenge(selectedChallenge.id!)?.evaluation ? (
                      <div className="space-y-6">
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                          <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-indigo-600">
                            {getSubmissionForChallenge(selectedChallenge.id!)?.evaluation?.score}
                            <span className="text-sm text-gray-400 font-normal">/100</span>
                          </div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Evaluation Score</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">Feedback</h4>
                          <p className="text-sm text-gray-600 italic">
                            "{getSubmissionForChallenge(selectedChallenge.id!)?.evaluation?.feedback}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-green-600 uppercase mb-2">Strengths</h4>
                            <ul className="space-y-1">
                              {getSubmissionForChallenge(selectedChallenge.id!)?.evaluation?.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-gray-600">• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-orange-600 uppercase mb-2">Improvements</h4>
                            <ul className="space-y-1">
                              {getSubmissionForChallenge(selectedChallenge.id!)?.evaluation?.improvements.map((s, i) => (
                                <li key={i} className="text-xs text-gray-600">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Your Project</h3>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">GitHub Repository URL</label>
                          <div className="relative">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              required
                              placeholder="https://github.com/username/repo"
                              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Brief Description</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Describe your implementation, tech stack, and any challenges you faced..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              AI Evaluating...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Submit for AI Review
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-center text-gray-400 italic">
                          AI evaluation usually takes 10-15 seconds.
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
