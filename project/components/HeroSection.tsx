import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pb-28">
      <div className="absolute -left-10 top-24 w-64 h-64 rounded-full bg-[#6B2FA0]/20 blur-3xl" />
      <div className="absolute -right-6 top-16 w-80 h-80 rounded-full bg-[#6B2FA0]/10 blur-3xl" />
      <div className="absolute right-10 bottom-6 w-56 h-56 rounded-full bg-[#A8D400]/10 blur-3xl" />

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[32px] outline outline-1 outline-[#6B2FA0] bg-[#A8D400]/10">
          <span className="w-2 h-2 bg-[#A8D400] rounded-full" />
          <span className="text-[#6B2FA0] text-base font-normal">La Falda, Córdoba · Lun a Vie 9–13 y 16–20</span>
        </div>

        <h1 className="mt-6 max-w-4xl text-zinc-900 text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight lg:leading-[72px]">
          Clínica Veterinaria <span className="text-[#6B2FA0]">Peón Pet&apos;s</span>
        </h1>

        <p className="mt-5 max-w-2xl text-zinc-700 text-lg leading-7">
          Cuidamos a tu mejor amigo con <span className="text-[#A8D400] font-semibold">dedicación</span> y profesionalismo
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
            <p className="mt-1 text-zinc-600 text-sm">Consultas realizadas</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-semibold text-[#A8D400]">95%</p>
            <p className="mt-1 text-zinc-600 text-sm">Clientes satisfechos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
