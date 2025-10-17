import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Always Evening',
  description: 'A podcast-style dialogue between Lena and Isaac exploring human meaning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

