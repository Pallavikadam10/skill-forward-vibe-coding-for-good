
export interface VibeStep {
  stepNumber: number;
  instruction: string;
}

export enum GigCategory {
  WEB_APP = 'Web App',
  CHROME_EXTENSION = 'Chrome Extension',
  DATA_VIZ = 'Data Visualizer',
  AUTOMATION = 'Automation',
  GAME = 'Game',
}

export type StackCost = 'Free' | 'Paid';

export type GigDuration = 'Easy (< 1 hr)' | 'Medium (2-4 hrs)' | 'Hard (> 8 hrs)';

export type ProblemType = 'Headache' | 'Migraine';
export type PainLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Repeatability = 'Constant' | 'Daily' | 'Weekly' | 'Monthly' | 'Once';

export interface CustomerPain {
  type: ProblemType;
  painLevel?: PainLevel;     // Only for Migraine
  repeatability?: Repeatability; // Only for Migraine
}

export interface Gig {
  id: string;
  title: string;
  clientVibe: string;
  recommendedStack: string;
  stackCost: StackCost;
  duration: GigDuration;
  payout: string;
  category: GigCategory;
  customerPain: CustomerPain;
  approach: VibeStep[];
}

export interface ProposalRequest {
  gig: Gig;
  coderNote: string;
}

// New Types for the Guide
export interface ToolRecommendation {
  name: string;
  url: string;
  reason: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
}

export interface ProjectPlan {
  tools: ToolRecommendation[];
  tasks: ProjectTask[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
