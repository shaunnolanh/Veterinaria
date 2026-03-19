import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BotonesFlotantes from "@/components/BotonesFlotantes";
import { CarritoProvider } from "@/context/CarritoContext";

export const metadata: Metadata = {
  title: "Clínica Veterinaria Peón Pet's | La Falda, Córdoba",
  description:
    "Cuidamos a tu mejor amigo con amor y profesionalismo. Consulta veterinaria, vacunación, urgencias, peluquería canina y radiología en La Falda, Córdoba.",
  keywords: [
    "veterinaria",
    "La Falda",
    "Córdoba",
    "mascotas",
    "vacunación",
    "peluquería canina",
    "urgencias veterinarias",
  ],
  openGraph: {
    title: "Clínica Veterinaria Peón Pet's",
    description: "Cuidamos a tu mejor amigo con amor y profesionalismo.",
    locale: "es_AR",
    type: "website",
  },
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-oscuro text-white min-h-screen">
        <CarritoProvider>
        {children}
        </CarritoProvider>
      </body>
    </html>
  );
}
