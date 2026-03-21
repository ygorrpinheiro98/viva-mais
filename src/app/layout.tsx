import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VIVA+ | Conectando Atletas",
  description: "Plataforma que conecta corredores e ciclistas para trocar experiências, treinos e dicas de nutrição.",
  keywords: ["corrida", "ciclismo", "atleta", "esporte", "nutrição", "treinos"],
  openGraph: {
    title: "VIVA+ | Conectando Atletas",
    description: "Conecte-se com corredores e ciclistas. Troque experiências, treinos e dicas de nutrição.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} scroll-smooth`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
