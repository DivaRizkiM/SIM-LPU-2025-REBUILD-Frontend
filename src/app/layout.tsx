import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import DrawerModal from "@/components/tools/drawer-modal";
import AlertDialog from "@/components/tools/alert-dialog";
import Providers from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false, 
});

export const metadata: Metadata = {
  title: "SIM-LPU",
  description: "Sistem Informasi Layanan Pos Universal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, user-scalable=no" /> 
      </head>
      <body className={inter.className} style={{height:'100dvh'}}>
          <Providers>
            {children}
            <Toaster/>
            <DrawerModal/>
            <AlertDialog/>
          </Providers>
      </body>
    </html>
  );
}

