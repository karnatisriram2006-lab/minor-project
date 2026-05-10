import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your YĀTRĀ travel hub. View upcoming trips, track budgets, and connect with companions.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
