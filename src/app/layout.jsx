import './globals.css';

export const metadata = {
  title: 'TopMCQBD',
  description: 'TopMCQBD Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
