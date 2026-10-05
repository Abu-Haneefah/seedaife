import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
// @ts-ignore -- Next.js processes this global stylesheet at build time.
import "./globals.css";
import SvgSprite from "@/components/SvgSprite";
import GlowCursor from "@/components/GlowCursor";
import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { ModalProvider } from "@/components/Modals";
import { TimeModeProvider } from "@/lib/time-mode";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://seedaiacademy.com"),
  title: "Seed AI Academy | Learn AI. Build with AI. Grow with AI.",
  description:
    "Seed AI Academy teaches coding and AI to children (6+), teenagers and adults through project-based courses. Learn AI. Build with AI. Grow with AI.",
  icons: {
    icon: "/images/seedai-icon.png",
    apple: "/images/seedai-icon.png",
  },
  openGraph: {
    type: "website",
    title: "Seed AI Academy",
    description:
      "Project-based courses where kids, teens and professionals go from using AI to building with it.",
    images: ["/images/seedai-logo-primary.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seed AI Academy",
    description:
      "Project-based courses where kids, teens and professionals go from using AI to building with it.",
    images: ["/images/seedai-logo-primary.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2A1450",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              document.documentElement.className += " js";
              try {
                var s = localStorage.getItem('seedai_time_mode_setting');
                var m = s;
                if (!s || s === 'auto') {
                  var h = new Date().getHours();
                  m = (h >= 5 && h < 12) ? 'morning' : (h >= 12 && h < 18) ? 'afternoon' : 'night';
                }
                document.documentElement.setAttribute('data-time-mode', m);
              } catch(e){}
            })();`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="grain" aria-hidden="true" />
        <TimeModeProvider>
          <GlowCursor />
          <SvgSprite />
          <Preloader />
          <ModalProvider>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppFab />
          </ModalProvider>
        </TimeModeProvider>
      </body>
    </html>
  );
}
