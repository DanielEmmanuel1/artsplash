import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/lib/wallet/WalletProvider";
import NetworkBanner from "@/components/wallet/NetworkBanner";

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
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dancingScript.variable} antialiased flex flex-col min-h-screen bg-white`}
      >
        <WalletProvider>
          <NetworkBanner />
          <Navbar />
          <main className="grow">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
