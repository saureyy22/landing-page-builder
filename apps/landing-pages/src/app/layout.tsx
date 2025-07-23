import type { Metadata } from 'next';
import './globals.css';
import PerformanceMonitor from '../components/PerformanceMonitor';

export const metadata: Metadata = {
  title: 'Landing Page Builder',
  description: 'Dynamic landing pages built with Contentful',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}