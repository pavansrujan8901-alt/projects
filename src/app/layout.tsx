import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import AccessibilityProvider from '@/components/providers/AccessibilityProvider';

export const metadata: Metadata = {
  title: 'Nivora – Personalized Memory & Cognitive Engagement',
  description: 'Nivora — Memories. People. Connection. Personalized cognitive engagement and memory assistance platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-scale-normal">
      <body className="bg-bloom-darkest text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-bloom-cyan selection:text-white transition-colors duration-200">
        <AccessibilityProvider>
          <Navbar />
          <main id="main-content" className="flex-1 pb-28">
            {children}
          </main>
          <AccessibilityToolbar />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
