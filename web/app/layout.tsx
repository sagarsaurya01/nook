import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Nook",
  description: "Your AI second brain for everything you save.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        <Shell />
      </body>
    </html>
  );
}
