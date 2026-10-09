# Fotos del sitio — guía para generarlas con IA

Todas las imágenes actuales son **placeholders** (llevan la etiqueta `PLACEHOLDER · nombre.jpg`).
Reemplaza cada JPG por la foto definitiva **con el mismo nombre** y ejecuta `npm run images`
para regenerar las versiones WebP (`nombre.webp` a 1600 px y `nombre-800.webp`).

**Estilo común para todos los prompts:** fotografía arquitectónica editorial, luz cálida de golden hour,
tonos ámbar y melocotón, cielo limpio, sin texto ni logos ni marcas de agua, alto rango dinámico natural,
lente 24–35 mm, sin personas salvo donde se indique.

| Archivo | Proporción / tamaño mínimo | Dónde se usa | Descripción / prompt |
|---|---|---|---|
| `living-sunset.jpg` | 1:1 · 1200×1200 | Manifiesto, imagen grande | Living minimalista con ventanales de piso a techo, sofá modular crema, alfombra de lana, chimenea lineal; el sol se pone sobre una bahía con colinas y la luz rasante entra en diagonal sobre el piso de madera clara. |
| `barrio-aereo.jpg` | 2.2:1 · 1800×820 | Manifiesto, panorámica | Vista aérea con dron de un barrio residencial histórico: casas adosadas de ladrillo rojo con techos de pizarra, árboles frondosos, farolas encendidas, cielo de atardecer. |
| `casa-piscina.jpg` | 14:9 · 1400×900 | Manifiesto, abajo izquierda | Casa moderna de una planta con grandes cristales e interior iluminado, terraza de piedra y piscina infinita que refleja un cielo naranja y violeta; mar y pinos al fondo. |
| `cocina.jpg` | 11:9 · 1100×900 | Manifiesto, abajo derecha | Cocina abierta en tonos arena con isla de piedra, taburetes de madera, lámparas colgantes, ventanal al lago y luz dorada del atardecer. |
| `agente.jpg` | 4:5 · 1200×1500 | Para agentes | Retrato de una agente inmobiliaria de unos 30 años, blazer crema, pantalón beige, sonrisa natural y segura, carpeta negra en la mano, apoyada en un escritorio con una maqueta de casa; oficina luminosa con plantas y ciudad desenfocada al fondo. Mirada a cámara. |
| `comprar.jpg` | 4:3 · 1400×1050 | Cómo te ayudamos → Comprar | Primer plano de un juego de llaves con llavero de casa sobre una mesa de mármol, living desenfocado con vista al skyline al atardecer. |
| `vender.jpg` | 4:3 · 1400×1050 | Cómo te ayudamos → Vender | Casa familiar de piedra y tejado a dos aguas con todas las luces encendidas, jardín cuidado con flores y césped, cielo de atardecer rosa y naranja. |
| `alquilar.jpg` | 4:3 · 1400×1050 | Cómo te ayudamos → Alquilar | Edificio residencial moderno de 6 pisos con balcones de vidrio y departamentos iluminados, hora azul con skyline de la ciudad al fondo. |
| `hipoteca.jpg` | 4:3 · 1400×1050 | Servicios → Financiamiento | Escritorio de madera con laptop, libreta, bolígrafo, taza y una pequeña maqueta de casa, ventana con vista a la bahía al atardecer. |
| `administracion.jpg` | 4:3 · 1400×1050 | Servicios → Administración | Fachada de edificio de departamentos contemporáneo con piedra y madera, acceso con jardines y senderos, sol bajo entre los árboles. |
| `construccion.jpg` | 4:3 · 1400×1050 | Servicios → Construcción | Obra en estructura de hormigón y vidrio con grúa torre, materiales en primer plano y sol poniéndose en el horizonte de la ciudad. |

También son placeholders: `../hero-poster.jpg` (primer fotograma del video demo) y `../og-image.jpg` (1200×630, se genera con `npm run images` a partir del póster).
