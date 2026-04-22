import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Digital Service Bay — IT Support Specialists",
  description:
    "Professional IT support: OS installation, networking, malware removal, security audits. Transparent pricing, instant diagnostics, deposit-confirmed bookings.",
  keywords: ["IT support", "tech repair", "OS installation", "network setup", "Ghana", "Kumasi"],
  openGraph: {
    title: "Digital Service Bay",
    description: "Your systems, running clean.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#040B0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Paystack inline JS SDK */}
        <script src="https://js.paystack.co/v1/inline.js" async />
      </head>
      <body style={{ background: "#040B0F", color: "#E2F0F8", fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
        <NavBar />
        <main style={{ paddingTop: 64 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
