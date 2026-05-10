import { Metadata } from 'next';
import BudgetOptimizer from './page';

export const metadata: Metadata = {
  title: 'Budget Planner',
  description: 'Track and optimize your India travel budget in real-time.',
};

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
