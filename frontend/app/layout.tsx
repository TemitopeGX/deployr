import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Deployr | Control Center",
  description: "Next-generation deployment orchestrator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased selection:bg-blue-500/30 overflow-hidden">
        <div className="flex h-screen w-full bg-[#030405]">
          <Sidebar />
          <div className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
