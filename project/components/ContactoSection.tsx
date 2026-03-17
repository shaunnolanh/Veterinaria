export default function ContactoSection() {
  const contactos = [
    {
      icono: "📞",
      titulo: "Teléfono fijo",
      valor: "03548-495677",
      href: "tel:+543548495677",
      color: "border-[#6B2FA0]/30 hover:border-[#6B2FA0]",
    },
    {
      icono: "📱",
      titulo: "Celular / WhatsApp",
      valor: "03548 15-63-2527",
      href: "tel:+5493548156327",
      color: "border-[#A8D400]/40 hover:border-[#A8D400]",
    },
    {
      icono: "📸",
      titulo: "Instagram",
      valor: "@peonpets.lafalda",
      href: "https://instagram.com/peonpets.lafalda",
      color: "border-[#6B2FA0]/30 hover:border-[#6B2FA0]",
    },
    {
      icono: "👍",
      titulo: "Facebook",
      valor: "Clínica Veterinaria Peon Pet's",
      href: "https://facebook.com",
      color: "border-[#A8D400]/40 hover:border-[#A8D400]",
    },
  ];

  return (
    <section id="contacto" className="py-20 px-6 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">¿Cómo contactarnos?</span>
          <h2 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2 mb-4">Contacto</h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Estamos disponibles para cualquier consulta o emergencia. No dudes en escribirnos o llamarnos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-5xl mx-auto">
          {contactos.map((c) => (
            <a
              key={c.titulo}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`card border-2 ${c.color} transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 no-underline`}
            >
              <span className="text-3xl">{c.icono}</span>
              <div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{c.titulo}</p>
                <p className="font-semibold text-zinc-900 mt-0.5">{c.valor}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://wa.me/5493548156327?text=Hola!%20Quiero%20consultar%20sobre%20turnos%20en%20la%20cl%C3%ADnica."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primario text-lg py-5 px-10 inline-flex"
          >
            💬 Escribinos por WhatsApp
          </a>
          <p className="text-zinc-500 text-sm mt-3">Respondemos lo antes posible en horario de atención</p>
        </div>
      </div>
    </section>
  );
}
