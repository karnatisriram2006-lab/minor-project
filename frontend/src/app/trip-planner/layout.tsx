import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Trip Planner',
  description: 'Plan your perfect journey through India with our AI-powered travel assistant.',
};

export default function TripPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
