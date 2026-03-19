import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import ParallaxScene from "@/components/ParallaxScene";
import ServiciosSection from "@/components/ServiciosSection";
import EquipoSection from "@/components/EquipoSection";
import HorariosSection from "@/components/HorariosSection";
import ResenasSection from "@/components/ResenasSection";
import UbicacionSection from "@/components/UbicacionSection";
import ContactoSection from "@/components/ContactoSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ParallaxScene />
      <ServiciosSection />

      <section className="px-6 lg:px-20 py-20 bg-[#6B2FA0]">
        <div className="max-w-[1280px] mx-auto text-center">
          <p className="text-[#A8D400] text-sm font-semibold uppercase tracking-[0.2em]">Peón Pet&apos;s</p>
          <h2 className="text-3xl md:text-5xl font-semibold text-white mt-3">Nuestra Tienda Online</h2>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto text-lg">
            Alimentos y accesorios para tu mascota, con retiro en La Falda
          </p>
          <div className="mt-8 flex justify-center">
          <Link
          href="/tienda"
          className="btn-secundario transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 active:scale-95"
          >
          Ir a la tienda
        </Link>
        </div>
        </div>
      </section>
      <EquipoSection />
      <HorariosSection />
      <ResenasSection />
      <UbicacionSection />
      <ContactoSection />
    </>
  );
}
