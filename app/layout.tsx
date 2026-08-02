import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Shorts Studio",
  description: "Manage multiple faceless YouTube channels"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="md:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
