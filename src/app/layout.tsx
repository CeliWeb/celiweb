import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CeliWeb - Productos y Restaurantes para Celíacos",
  description: "Comunidad de productos y restaurantes aptos para celíacos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="bg-white border-b">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-bold text-green-600">
                  CeliWeb
                </Link>
                <div className="flex gap-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Mapa
                  </Link>
                  <Link
                    href="/productos"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Productos
                  </Link>
                </div>
              </div>
              <AuthButton />
            </nav>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
