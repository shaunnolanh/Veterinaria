"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = ["/slide_hero_1.jpg", "/slide_hero_2.jpg", "/slide_hero_3.jpg"];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden pt-16 pb-20 lg:pb-28 lg:min-h-[600px] lg:flex lg:items-center"
      style={{
        background:
          "linear-gradient(135deg, #ffffff, #f3e8ff, #ede9f6, #ffffff)",
        backgroundSize: "300% 300%",
        animation: "gradientBreath 10s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradientBreath {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[32px] outline outline-1 outline-[#6B2FA0] bg-[#A8D400]/10">
              <span className="w-2 h-2 bg-[#A8D400] rounded-full" />
              <span className="text-[#6B2FA0] text-base font-normal">
                La Falda, Córdoba · Lun a Vie 9–13 y 16–20
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-zinc-900 text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight lg:leading-[72px]">
              Clínica Veterinaria{" "}
              <span className="text-[#6B2FA0]">Peón Pet&apos;s</span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-700 text-lg leading-7">
              Cuidamos a tu mejor amigo con{" "}
              <span className="text-[#A8D400] font-semibold">dedicación</span> y
              profesionalismo
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
              <Link href="/turnos" className="btn-primario">
                Sacá tu turno
              </Link>
              <a
                href="https://wa.me/5493548156327"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secundario"
              >
                Escribinos por WhatsApp
              </a>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div className="card text-center">
                <p className="text-4xl font-semibold text-[#A8D400]">90K</p>
                <p className="mt-1 text-zinc-600 text-sm">Mascotas atendidas</p>
              </div>
              <div className="card text-center">
                <p className="text-4xl font-semibold text-[#A8D400]">150K</p>
                <p className="mt-1 text-zinc-600 text-sm">
                  Consultas realizadas
                </p>
              </div>
              <div className="card text-center">
                <p className="text-4xl font-semibold text-[#A8D400]">95%</p>
                <p className="mt-1 text-zinc-600 text-sm">
                  Clientes satisfechos
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 lg:mt-0">
            <div className="relative h-[260px] lg:h-[520px] rounded-2xl overflow-hidden shadow-xl">
              {slides.map((slide, index) => (
                <img
                  key={slide}
                  src={slide}
                  alt={`Slide ${index + 1} clínica veterinaria`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir al slide ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-opacity ${
                    currentSlide === index ? "opacity-100" : "opacity-40"
                  }`}
                  style={{ backgroundColor: "#6B2FA0" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
