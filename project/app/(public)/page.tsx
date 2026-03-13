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
      <EquipoSection />
      <HorariosSection />
      <ResenasSection />
      <UbicacionSection />
      <ContactoSection />
    </>
  );
}
