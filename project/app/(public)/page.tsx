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

      <section className="px-4 py-16 bg-oscuro-medio border-y border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-verde-lima text-sm font-bold uppercase tracking-widest">Peón Pet&apos;s</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Nuestra Tienda Online</h2>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            Alimentos y accesorios para tu mascota, con retiro en La Falda
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/tienda" className="btn-primario">
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
