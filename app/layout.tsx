import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitApp",
  description: "Split expenses with friends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
