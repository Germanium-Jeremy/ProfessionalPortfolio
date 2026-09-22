import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio and project showcase",
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <Script src="/theme.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
