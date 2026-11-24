// Fonts are self-hosted via @fontsource, so the site works offline and the canvas can use them by name.
import '@fontsource/fredoka/latin-400.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/bangers/latin-400.css';
import './globals.css';
import SiteHeader from '@/components/shared/SiteHeader';
import { ToastProvider } from '@/components/shared/Toast';

export const metadata = {
  title: 'Learn Science: Lab Sains Virtual',
  description: 'Belajar Kimia, Fisika, dan Biologi SMA dengan bereksperimen, bukan menghafal.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }){
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          <div className="wrap">
            <SiteHeader />
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
