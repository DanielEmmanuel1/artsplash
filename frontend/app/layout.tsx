import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/lib/wallet/WalletProvider";
import NetworkBanner from "@/components/wallet/NetworkBanner";
import ThemeProvider from "@/components/ThemeProvider";
import ModeRedirectHandler from "@/components/ModeRedirectHandler";
import ConditionalLayout from "@/components/ConditionalLayout";
import OnboardingModal from "@/components/OnboardingModal";
import { useSettings } from "@/lib/settingsStore";
import { useEffect } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artistic Splash - NFT Marketplace",
  description: "Create, mint, and trade NFTs on Avalanche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global loader overlay element
  const LoaderOverlay = () => {
    const { isGlobalLoading } = useSettings();
    if (!isGlobalLoading) return null;
    return (
      <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-lightBlue border-t-transparent" />
      </div>
    );
  };
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dancingScript.variable} antialiased flex flex-col min-h-screen bg-white dark:bg-metallicBlack transition-colors duration-300`}
      >
        <WalletProvider>
          <ThemeProvider>
            <ModeRedirectHandler />
            <NetworkBanner />
            <ConditionalLayout>
              <Navbar />
            </ConditionalLayout>
            <main className="grow">{children}</main>
            <OnboardingModal />
            <LoaderOverlay />
            <ConditionalLayout>
              <Footer />
            </ConditionalLayout>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
