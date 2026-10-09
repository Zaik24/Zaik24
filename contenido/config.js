/* =====================================================================
   EL FAROLITO — DATOS DEL RESTAURANTE
   ---------------------------------------------------------------------
   Edita aquí los datos de contacto. Deja "" (vacío) lo que no quieras
   mostrar: el sitio oculta automáticamente lo que esté vacío.
   ===================================================================== */
window.SITE_CONFIG = {
  nombre: "El Farolito",

  // Teléfono tal como se muestra y en formato internacional para enlaces
  telefono: "",            // ej. "+34 928 00 00 00"
  // WhatsApp: solo números con prefijo de país, sin "+" ni espacios
  whatsapp: "",            // ej. "34600000000"
  email: "",               // ej. "reservas@elfarolito.es"
  instagram: "",           // ej. "https://instagram.com/elfarolito"

  // Dirección (se muestra tal cual)
  direccion: "Corralejo, Fuerteventura · Islas Canarias",
  // Enlace a Google Maps (búsqueda o ficha del restaurante)
  mapa: "https://www.google.com/maps/search/?api=1&query=El+Farolito+Corralejo+Fuerteventura",

  // Idioma por defecto si el navegador no indica preferencia: "es" o "en"
  idiomaPorDefecto: "es",

  /* Portada controlada por scroll ------------------------------------
     alturaPantallas: cuántas alturas de pantalla dura la portada fijada.
     escenas: en qué tramo del video (0 = inicio, 1 = final) aparece cada
     texto. Ajusta estos números para sincronizarlos con tu video:
       escena 1 → mar / dunas de Corralejo
       escena 2 → cocina / fuego / pasta
       escena 3 → restaurante / mesa servida (muestra "Reservar mesa") */
  portada: {
    alturaPantallas: 4,
    escenas: [
      [0.00, 0.28],   // emplatado en la parrilla
      [0.34, 0.56],   // plato terminado (se oculta antes del vapor blanco)
      [0.72, 1.00]    // el plato llega a la mesa
    ]
  }
};
