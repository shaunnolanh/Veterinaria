// app/(public)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BotonesFlotantes from "@/components/BotonesFlotantes";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BotonesFlotantes />
    </>
  );
}