/* =====================================================================
   EL FAROLITO — TEXTOS DEL SITIO (ES / EN)
   ---------------------------------------------------------------------
   Todo el texto visible está aquí. Cambia el texto entre comillas y
   guarda: no hace falta tocar el HTML.
   - Cada clave existe en "es" y en "en". Mantén ambas.
   - Puedes usar <em>…</em> para cursiva y <br> para salto de línea.
   - Lo que quede vacío ("") o como lista vacía ([]) no se muestra.
   ===================================================================== */
window.SITE_TEXT = {
  /* ------------------------------------------------------------------ */
  es: {
    meta: {
      title: "El Farolito — Cocina uruguaya e italiana en Corralejo, Fuerteventura",
      description: "Restaurante de cocina uruguaya e italiana en Corralejo, Fuerteventura. Fuego, pasta hecha a mano y sobremesa larga junto al Atlántico."
    },
    a11y: {
      skip: "Saltar al contenido",
      menu: "Abrir menú",
      close: "Cerrar menú",
      lang: "Idioma del sitio",
      hero: "Portada: del Río de la Plata al Atlántico",
      scroll: "Desliza para descubrir"
    },
    nav: {
      historia: "Historia",
      cocina: "Cocina",
      carta: "Carta",
      ambiente: "Ambiente",
      equipo: "Equipo",
      reservar: "Reservar"
    },

    /* Portada: una línea por escena del video */
    hero: {
      escena1: "Del Río de la Plata al Atlántico.",
      escena2: "Recetas de Uruguay e Italia, <em>hechas a mano.</em>",
      escena3: "El Farolito — Cocina uruguaya e italiana en Corralejo.",
      cta: "Reservar mesa",
      hint: "Desliza"
    },

    historia: {
      kicker: "Nuestra historia",
      titulo: "Dos orillas, <em>una misma mesa.</em>",
      p1: "En Uruguay, la cocina italiana llegó en barco y se quedó para siempre: la pasta de los domingos convive con el fuego lento de la parrilla.",
      p2: "En El Farolito traemos esa mesa compartida a Corralejo, frente al Atlántico. Cocina de familia, ingredientes nobles y tiempo para disfrutar.",
      origen1: "Río de la Plata",
      origen2: "Italia",
      destino: "Corralejo"
    },

    cocina: {
      kicker: "La cocina",
      titulo: "Fuego, harina <em>y paciencia.</em>",
      p1: "La parrilla se enciende con calma. La pasta se amasa y se corta a mano. Recetas que se aprenden mirando y se cocinan sin prisa.",
      fotoAlt: "La cocina y la parrilla de El Farolito",
      punto1: "Parrilla al estilo uruguayo",
      punto2: "Pasta fresca hecha a mano",
      punto3: "Recetas de familia"
    },

    carta: {
      kicker: "La carta",
      titulo: "Para compartir <em>sin mirar el reloj.</em>",
      intro: "Una selección de lo que sale de nuestra cocina. Consulta la carta completa y las sugerencias del día en el restaurante.",
      /* Categorías. En "platos" puedes añadir platos reales de la carta:
         platos: [ { nombre: "Nombre del plato", desc: "Descripción breve", precio: "00 €" } ]
         Si la lista está vacía, solo se muestra la foto y la descripción. */
      categorias: [
        {
          id: "principales",
          titulo: "Platos principales",
          desc: "Del fuego de la parrilla a la pasta recién hecha.",
          fotoAlt: "Platos principales de El Farolito",
          platos: []
        },
        {
          id: "postres",
          titulo: "Postres",
          desc: "Para alargar la sobremesa.",
          fotoAlt: "Postres de El Farolito",
          platos: []
        },
        {
          id: "bebidas",
          titulo: "Bebidas",
          desc: "Para brindar al atardecer.",
          fotoAlt: "Bebidas de El Farolito",
          platos: []
        }
      ],
      nota: "Infórmanos de cualquier alergia o intolerancia al reservar."
    },

    ambiente: {
      kicker: "El lugar",
      titulo: "Sol afuera, <em>calor adentro.</em>",
      terraza: "La terraza",
      terrazaDesc: "Al aire libre, con la brisa del Atlántico.",
      terrazaAlt: "Fachada y terraza de El Farolito en Corralejo",
      salon: "El salón",
      salonDesc: "Un comedor cálido para cenas largas.",
      salonAlt: "Salón interior de El Farolito"
    },

    equipo: {
      kicker: "El equipo",
      titulo: "Las manos <em>detrás de cada plato.</em>",
      p1: "Un equipo que cocina y recibe como en casa. Te esperamos con la mesa puesta.",
      fotoAlt: "El equipo de El Farolito"
    },

    reservas: {
      kicker: "Reservas",
      titulo: "Te guardamos <em>la mesa.</em>",
      intro: "Escríbenos con los datos de tu reserva y te confirmamos lo antes posible.",
      nombre: "Nombre",
      fecha: "Fecha",
      hora: "Hora",
      personas: "Personas",
      telefono: "Teléfono",
      notas: "Comentarios (alergias, ocasión especial…)",
      enviarWhatsapp: "Enviar por WhatsApp",
      enviarEmail: "Enviar por email",
      sinCanal: "Para reservar, llámanos o visítanos en el restaurante.",
      mensaje: "Hola, me gustaría reservar en El Farolito.",
      contacto: "Contacto",
      direccion: "Dirección",
      comoLlegar: "Cómo llegar",
      horario: "Horario",
      /* Horario: añade una línea por franja, ej. "Martes a domingo · 13:00–23:00".
         Vacío = no se muestra. */
      horarioLineas: [],
      llamar: "Llamar",
      error: "Revisa los campos marcados."
    },

    footer: {
      lema: "Cocina uruguaya e italiana en Corralejo, Fuerteventura.",
      derechos: "Todos los derechos reservados."
    }
  },

  /* ------------------------------------------------------------------ */
  en: {
    meta: {
      title: "El Farolito — Uruguayan & Italian cuisine in Corralejo, Fuerteventura",
      description: "Uruguayan and Italian restaurant in Corralejo, Fuerteventura. Open fire, handmade pasta and long, lingering meals by the Atlantic."
    },
    a11y: {
      skip: "Skip to content",
      menu: "Open menu",
      close: "Close menu",
      lang: "Site language",
      hero: "Cover: from the Río de la Plata to the Atlantic",
      scroll: "Scroll to discover"
    },
    nav: {
      historia: "Story",
      cocina: "Kitchen",
      carta: "Menu",
      ambiente: "The place",
      equipo: "Team",
      reservar: "Book"
    },

    hero: {
      escena1: "From the Río de la Plata to the Atlantic.",
      escena2: "Recipes from Uruguay and Italy, <em>made by hand.</em>",
      escena3: "El Farolito — Uruguayan & Italian cuisine in Corralejo.",
      cta: "Book a table",
      hint: "Scroll"
    },

    historia: {
      kicker: "Our story",
      titulo: "Two shores, <em>one table.</em>",
      p1: "In Uruguay, Italian cooking arrived by ship and stayed for good: Sunday pasta lives side by side with the slow fire of the grill.",
      p2: "At El Farolito we bring that shared table to Corralejo, facing the Atlantic. Family cooking, honest ingredients and time to enjoy it.",
      origen1: "Río de la Plata",
      origen2: "Italy",
      destino: "Corralejo"
    },

    cocina: {
      kicker: "The kitchen",
      titulo: "Fire, flour <em>and patience.</em>",
      p1: "The grill is lit slowly. Pasta is kneaded and cut by hand. Recipes learned by watching and cooked without hurry.",
      fotoAlt: "The kitchen and grill at El Farolito",
      punto1: "Uruguayan-style grill",
      punto2: "Fresh handmade pasta",
      punto3: "Family recipes"
    },

    carta: {
      kicker: "The menu",
      titulo: "Made for sharing, <em>not for watching the clock.</em>",
      intro: "A taste of what comes out of our kitchen. Ask for the full menu and today's suggestions at the restaurant.",
      categorias: [
        {
          id: "principales",
          titulo: "Main courses",
          desc: "From the fire of the grill to freshly made pasta.",
          fotoAlt: "Main courses at El Farolito",
          platos: []
        },
        {
          id: "postres",
          titulo: "Desserts",
          desc: "To make the conversation last longer.",
          fotoAlt: "Desserts at El Farolito",
          platos: []
        },
        {
          id: "bebidas",
          titulo: "Drinks",
          desc: "For a toast at sunset.",
          fotoAlt: "Drinks at El Farolito",
          platos: []
        }
      ],
      nota: "Please let us know about any allergies or intolerances when booking."
    },

    ambiente: {
      kicker: "The place",
      titulo: "Sun outside, <em>warmth inside.</em>",
      terraza: "The terrace",
      terrazaDesc: "Open air, with the Atlantic breeze.",
      terrazaAlt: "Front and terrace of El Farolito in Corralejo",
      salon: "The dining room",
      salonDesc: "A warm room for long dinners.",
      salonAlt: "Dining room at El Farolito"
    },

    equipo: {
      kicker: "The team",
      titulo: "The hands <em>behind every plate.</em>",
      p1: "A team that cooks and welcomes you as if you were at home. Your table is ready.",
      fotoAlt: "The El Farolito team"
    },

    reservas: {
      kicker: "Bookings",
      titulo: "We'll save you <em>a table.</em>",
      intro: "Send us your booking details and we'll confirm as soon as possible.",
      nombre: "Name",
      fecha: "Date",
      hora: "Time",
      personas: "Guests",
      telefono: "Phone",
      notas: "Notes (allergies, special occasion…)",
      enviarWhatsapp: "Send via WhatsApp",
      enviarEmail: "Send by email",
      sinCanal: "To book, give us a call or visit us at the restaurant.",
      mensaje: "Hello, I'd like to book a table at El Farolito.",
      contacto: "Contact",
      direccion: "Address",
      comoLlegar: "Get directions",
      horario: "Opening hours",
      horarioLineas: [],
      llamar: "Call",
      error: "Please check the highlighted fields."
    },

    footer: {
      lema: "Uruguayan & Italian cuisine in Corralejo, Fuerteventura.",
      derechos: "All rights reserved."
    }
  }
};
