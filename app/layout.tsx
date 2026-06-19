import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 1. Initialize your custom font configuration
const hopeSans = localFont({
  src: "./fonts/hope_handwriting-regular.ttf",
  variable: "--font-hope",
  display: "swap",                
});

export const metadata: Metadata = {
  title: "Hope | Interactive Portfolio",
  description: "A paper doll themed porfolio made by Hope De Jesus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Pass the font variable string into the HTML body's class list
    <html lang="en">
      <body className={`${hopeSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}