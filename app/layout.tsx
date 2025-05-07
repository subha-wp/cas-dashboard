import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health Card Management System',
  description: 'Manage health cards, households, and members',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRConfig value={swrConfig}>
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}