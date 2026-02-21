import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MuiThemeProvider from "@/theme/MuiThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fin Smart",
  description: "Personal finance management application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fin Smart",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Fin Smart",
    title: "Fin Smart",
    description: "Gestiona tus finanzas personales de forma sencilla",
  },
  twitter: {
    card: "summary",
    title: "Fin Smart",
    description: "Gestiona tus finanzas personales de forma sencilla",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1976d2" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
