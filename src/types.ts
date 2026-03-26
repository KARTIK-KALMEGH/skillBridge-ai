export interface Badge {
  id: string;
  name: string;
  issuedAt: string;
  icon: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'mentor' | 'recruiter' | 'admin';
  interests?: string[];
  careerGoal?: string;
  skills?: Record<string, number>;
  badges?: Badge[];
  createdAt: string;
}

export interface RoadmapStep {
  month: string;
  topics: string[];
  resources: string[];
}

export interface SkillRoadmap {
  id?: string;
  uid: string;
  goal: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export interface Internship {
  id?: string;
  title: string;
  company: string;
  description: string;
  stipend: string;
  location: string;
  postedBy: string;
  createdAt: string;
}
