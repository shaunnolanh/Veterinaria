export default function ContactoSection() {
  const contactos = [
    {
      icono: "📞",
      titulo: "Teléfono fijo",
      valor: "03548-495677",
      href: "tel:+543548495677",
      color: "border-verde-lima/30 hover:border-verde-lima",
    },
    {
      icono: "📱",
      titulo: "Celular / WhatsApp",
      valor: "03548 15-63-2527",
      href: "tel:+5493548156327",
      color: "border-green-500/30 hover:border-green-500",
    },
    {
      icono: "📸",
      titulo: "Instagram",
      valor: "@peonpets.lafalda",
      href: "https://instagram.com/peonpets.lafalda",
      color: "border-violeta/30 hover:border-violeta",
    },
    {
      icono: "👍",
      titulo: "Facebook",
      valor: "Clínica Veterinaria Peon Pet's",
      href: "https://facebook.com",
      color: "border-cian/30 hover:border-cian",
    },
  ];

  return (
    <section id="contacto" className="seccion">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-verde-lima text-sm font-bold uppercase tracking-widest">
            ¿Cómo contactarnos?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">
            Contacto
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Estamos disponibles para cualquier consulta o emergencia. No dudes en
            escribirnos o llamarnos.
          </p>
        </div>

        {/* Grilla de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  {c.titulo}
                </p>
                <p className="font-bold text-white mt-0.5">{c.valor}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Botón WhatsApp grande */}
        <div className="text-center">
          <a
            href="https://wa.me/5493548156327?text=Hola!%20Quiero%20consultar%20sobre%20turnos%20en%20la%20cl%C3%ADnica."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secundario text-lg py-5 px-10 inline-flex"
          >
            💬 Escribinos por WhatsApp
          </a>
          <p className="text-white/40 text-sm mt-3">
            Respondemos lo antes posible en horario de atención
          </p>
        </div>
      </div>
    </section>
  );
}
