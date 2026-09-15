import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas Bank",
  description: "Modern digital banking for secure transfers, global banking, and customer-first support.",
};

const CUSTOMER_CARE_EMAIL = "workdaysupport.novatech@gmail.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <a
          className="customer-care-fab"
          href={`mailto:${CUSTOMER_CARE_EMAIL}?subject=Atlas%20Bank%20Customer%20Care`}
          aria-label="Contact Atlas Bank Customer Care"
        >
          <span aria-hidden="true">💬</span>
          <span>Customer Care</span>
        </a>
      </body>
    </html>
  );
}
