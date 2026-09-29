import type { Metadata, Viewport } from 'next';
import { Cormorant, Jost, Tenor_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { BrandSymbols } from '@/components/brand';
import { Preloader } from '@/components/preloader';
import { getDictionary } from '@/content';
import { hasLocale, LOCALES } from '@/lib/i18n';
import { PRELOADED_KEY } from '@/lib/motion';
import { SITE_URL } from '@/lib/seo';
import '@/styles/globals.css';

// Cormorant for headings and prices, Tenor Sans for the small capitals (close to the lettering on
// the restaurant's menu), Jost for reading. Self-hosted by next/font.
const serif = Cormorant({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Jost({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const caps = Tenor_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-caps',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: '/fr', en: '/en', 'x-default': '/fr' },
    },
    // A proposal next to the live site: keep it out of search results (README, "Before launch").
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: 'Dar Zellij',
      locale: lang === 'fr' ? 'fr_FR' : 'en_GB',
      url: `/${lang}`,
      title: meta.title,
      description: meta.description,
      images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/og.jpg'],
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: '/apple-touch-icon.png',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#1a1311',
  colorScheme: 'light',
};

// Before first paint, on the first page view of the session (and with motion allowed): show the
// preloader (is-preloading, removed when it ends) and delay the hero intro until the curtains part
// (has-preloader). Both are pure CSS from here on (see Preloader in globals.css).
const HEAD_SCRIPT = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${PRELOADED_KEY}')){d.classList.add('has-preloader','is-preloading');sessionStorage.setItem('${PRELOADED_KEY}','1')}}catch(e){}`;

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${serif.variable} ${sans.variable} ${caps.variable}`}
      // The head script adds classes to <html> before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <BrandSymbols />
        <a className="skip-link" href="#main">
          {t.a11y.skip}
        </a>
        <Preloader est={t.preloader.est} city={t.preloader.city} />
        {children}
      </body>
    </html>
  );
}
