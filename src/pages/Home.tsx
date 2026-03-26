import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Users, Rocket, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Home({ user, profile }: HomeProps) {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/onboarding');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      title: "AI Career Mentor",
      description: "Chat with an AI that understands your skills and career goals."
    },
    {
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Skill Assessment",
      description: "Take tests to evaluate your technical and soft skills."
    },
    {
      icon: <Rocket className="w-6 h-6 text-indigo-600" />,
      title: "Personalized Roadmaps",
      description: "Get a step-by-step learning path to reach your dream job."
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Internship Finder",
      description: "Discover real-world projects and internship opportunities."
    }
  ];

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm border border-indigo-100"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bridging the Skill Gap in India</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight"
        >
          Your AI-Powered <span className="text-indigo-600">Career Mentor</span> for the Future
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 max-w-2xl"
        >
          Stop guessing your career path. Get industry-ready skills with personalized roadmaps, AI mentoring, and real-world projects.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSignIn}
              className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button className="bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all border border-slate-200">
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Empowering 40M+ Students Across India</h2>
          <p className="text-indigo-100 text-lg mb-8">Join the community of learners who are transforming their careers with AI-driven mentorship.</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-300" />
              <span className="font-medium">Industry-recognized skill badges</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-300" />
              <span className="font-medium">Direct access to top recruiters</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-300" />
              <span className="font-medium">Real-world project experience</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center">
            <div className="text-4xl font-bold mb-2">40M+</div>
            <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center">
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Mentors</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center">
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Companies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center">
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Success Rate</div>
          </div>
        </div>
      </section>
    </div>
  );
}
