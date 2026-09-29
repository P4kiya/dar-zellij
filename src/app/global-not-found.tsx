import type { Metadata } from 'next';
import { Cormorant, Tenor_Sans } from 'next/font/google';
import '@/styles/globals.css';

const serif = Cormorant({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});
const caps = Tenor_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-caps',
});

export const metadata: Metadata = {
  title: 'Dar Zellij · Page introuvable / Page not found',
  robots: { index: false },
};

/** Any address outside /fr and /en. Both languages, since there is no language to go by. */
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${serif.variable} ${caps.variable}`}>
      <body className="not-found">
        <main className="not-found__inner">
          <p className="eyebrow">404</p>
          <h1 className="section-title">
            Page <em>introuvable</em>
          </h1>
          <p lang="en" className="not-found__en">
            Page not found
          </p>
          <p className="not-found__links">
            <a href="/fr">Retour à l’accueil</a>
            <span aria-hidden="true">·</span>
            <a href="/en" lang="en">
              Back to the home page
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
