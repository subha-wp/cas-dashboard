/* eslint-disable @typescript-eslint/no-explicit-any */
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SWRConfig } from "swr";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Card Management System",
  description: "Manage health cards, households, and members",
};

const swrConfig = {
  fetcher: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error("An error occurred while fetching the data.");
      const data = await res.json();
      (error as any).info = data.error;
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  },
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRConfig value={swrConfig}>{children}</SWRConfig>
      </body>
    </html>
  );
}
