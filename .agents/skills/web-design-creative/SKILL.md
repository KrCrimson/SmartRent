---
name: web-design-creative
description: >
  Use this skill whenever an agent is asked to design, plan, or build a website, landing page,
  or any web UI. Triggers on: "diseña una landing", "crea una página web", "quiero una web para
  mi negocio", "haz el diseño de un sitio", "landing page para [rubro]", "web para [tipo de empresa]",
  or any request that implies building a frontend with a visual identity. Always use this skill before
  writing a single line of CSS or HTML. It ensures the design decision is rooted in the client's
  industry, uses a defensible color system with proper contrast, and avoids generic AI-default looks.
---

# Web Design Creative — Skill para Agentes IA

Este skill guía al agente a tomar decisiones de diseño **específicas al rubro del cliente** antes de escribir código, garantizando contraste legible y una paleta coherente.

---

## Paso 0 — Captura el brief mínimo

Antes de cualquier decisión visual, extrae o infiere:

| Dato | Pregunta si no está en el brief |
|---|---|
| **Rubro / industria** | ¿A qué se dedica el negocio? |
| **Audiencia objetivo** | ¿Quién visita la página? (edad, perfil) |
| **Objetivo principal** | ¿Qué debe lograr la página? (venta, captación, info) |
| **Tono de marca** | ¿Formal, cálido, técnico, juvenil, lujoso? |
| **Restricciones** | ¿Hay colores de marca ya definidos? |

Si el brief ya responde estas preguntas, **no vuelvas a preguntar** — procede directamente.

---

## Paso 1 — Selecciona el esquema de color según el rubro

### Cómo elegir el esquema correcto

Primero elige el **esquema base** según la psicología del rubro:

```
ANÁLOGO         → rubros de confianza, calma, bienestar
                  (salud, spa, finanzas personales, educación infantil)

COMPLEMENTARIO  → rubros de acción, contraste, energía
                  (deporte, tecnología, entretenimiento, e-commerce)

TRIÁDICO        → rubros creativos, vibrantes, diversidad
                  (diseño gráfico, moda, eventos, gastronomía casual)

MONOCROMÁTICO   → rubros de lujo, seriedad, minimalismo
                  (arquitectura, consultoría, legal, moda premium)

SPLIT-COMPLEMENTARIO → rubros que necesitan dinamismo sin agresividad
                  (agencias creativas, startups, productos digitales)
```

### Construcción de la paleta (4–6 colores con roles definidos)

Define exactamente estos roles:

```
PRIMARY     → Color dominante de la marca (40% del espacio visual)
SECONDARY   → Color de apoyo (30%)
ACCENT      → Color de llamada a la acción / botones (10–15%)
NEUTRAL_DARK → Para texto principal sobre fondo claro (debe cumplir WCAG AA)
NEUTRAL_LIGHT → Para fondos y espacios de respiro
SURFACE     → (opcional) Para cards, separadores, elevación
```

**Nunca uses:**
- `#000000` puro para texto — usa variantes oscuras (ej. `#1A1A2E`)
- `#FFFFFF` puro como único fondo — incorpora al menos una variante crema/gris
- El accent como color de texto sobre fondo similar en luminosidad

---

## Paso 2 — Verifica el contraste antes de asignar texto

Para cada combinación texto/fondo, calcula el ratio de contraste WCAG:

### Fórmula de luminancia relativa

```
L = 0.2126 × R_lin + 0.7152 × G_lin + 0.0722 × B_lin
donde X_lin = (X/255)^2.2 (aproximación)

Ratio = (L_claro + 0.05) / (L_oscuro + 0.05)
```

### Umbrales mínimos

```
Texto normal (<18px):      ratio ≥ 4.5 : 1   (WCAG AA)
Texto grande (≥18px bold): ratio ≥ 3.0 : 1   (WCAG AA Large)
Texto hero / display:      ratio ≥ 3.0 : 1   (mínimo tolerable)
Objetivo ideal:            ratio ≥ 7.0 : 1   (WCAG AAA)
```

### Combinaciones típicas válidas por esquema

| Fondo | Texto recomendado | Ratio aproximado |
|---|---|---|
| Claro (#F8F9FA) | Oscuro (#1A1A2E) | ~14:1 ✅ |
| Primary saturado | Blanco roto (#FAFAFA) | Verificar según tono |
| Accent vibrante | Negro suave (#111) | Verificar según tono |
| Oscuro (#0D1117) | Claro (#E8EDF2) | ~12:1 ✅ |

**Si una combinación falla el ratio → ajusta la luminosidad del color, no el tono.** Mantén el hue (matiz) del esquema elegido.

---

## Paso 3 — Ancla la paleta en el rubro (ejemplos de referencia)

Consulta `/references/industry-palettes.md` para puntos de partida por industria.

La paleta no es punto de llegada, es punto de partida. Cada color debe justificarse:

```
✅ "Usé verde salvia (#7C9A7E) como PRIMARY porque el rubro es bienestar
   y la audiencia son mujeres 25–40 que asocian ese tono con naturaleza
   y calma, sin caer en el verde hospitalario genérico."

❌ "Usé verde porque es para salud."
```

---

## Paso 4 — Define la tipografía (2–3 familias con roles)

```
DISPLAY (hero, headlines grandes)
→ Debe tener personalidad. Busca en Google Fonts algo que NO sea
  Inter, Roboto, o Open Sans como display.
  Ejemplos: Playfair Display, Space Grotesk, Syne, Cormorant Garamond,
  DM Serif Display, Bricolage Grotesque

BODY (párrafos, descripciones)
→ Alta legibilidad a tamaños pequeños.
  Ejemplos: Inter, Plus Jakarta Sans, Source Serif 4, Lora

UTILITY (opcional — etiquetas, badges, datos)
→ Monoespaciado o condensado si el rubro lo justifica.
```

**Type scale mínimo:**

```css
--text-xs:   0.75rem  /* etiquetas, captions */
--text-sm:   0.875rem /* textos secundarios */
--text-base: 1rem     /* body */
--text-lg:   1.125rem /* body destacado */
--text-xl:   1.25rem  /* subtítulos */
--text-2xl:  1.5rem   /* títulos de sección */
--text-4xl:  2.25rem  /* headline principal */
--text-6xl:  3.75rem  /* hero display */
```

---

## Paso 5 — El elemento firma

Cada diseño necesita **un elemento que no se olvidará** y que no podría pertenecer a otro rubro.

No es decoración. Es una elección estructural que expresa la identidad del negocio.

Ejemplos por tipo:
- **Textura de fondo** que evoca el material del rubro (madera para carpintería, trazo médico para clínica)
- **Forma de clip-path** inusual en la sección hero
- **Animación de entrada** específica al producto (goteo para cafetería, pulso para salud)
- **Grid layout** inspirado en la lógica del negocio (rejilla de ingredientes para gastronomía)
- **Tipografía tratada** como imagen en el hero

---

## Paso 6 — Plan de diseño (entregar antes de escribir código)

Antes de codificar, produce este resumen para confirmación:

```
RUBRO: [industria]
AUDIENCIA: [perfil]
OBJETIVO: [acción principal de la página]

ESQUEMA DE COLOR: [tipo elegido + justificación en 1 línea]
PALETA:
  PRIMARY:       #XXXXXX — [rol y justificación]
  SECONDARY:     #XXXXXX — [rol]
  ACCENT:        #XXXXXX — [rol — usado en CTAs]
  NEUTRAL_DARK:  #XXXXXX — [texto principal]
  NEUTRAL_LIGHT: #XXXXXX — [fondos]

CONTRASTE VERIFICADO:
  NEUTRAL_DARK sobre NEUTRAL_LIGHT: X.X:1 ✅/❌
  Texto sobre PRIMARY: X.X:1 ✅/❌
  Texto sobre ACCENT: X.X:1 ✅/❌

TIPOGRAFÍA:
  Display: [nombre] — [por qué este, no otro]
  Body:    [nombre]

ELEMENTO FIRMA: [descripción en 1–2 líneas]

LAYOUT HERO: [descripción breve en prosa + ASCII si ayuda]
```

---

## Errores comunes a evitar

```
❌ Fondo crema (#F4F1EA) + serif display + acento terracota
   → Combinación sobreusada en outputs de IA. Evitar salvo brief explícito.

❌ Fondo casi-negro + un único acento verde ácido o rojo vermillón
   → Segunda combinación más genérica de IA.

❌ Layout broadsheet (columnas periódico, hairline rules, cero border-radius)
   → Tercera combinación genérica. Solo si el rubro lo pide explícitamente.

❌ Usar el color de acento como color de texto sobre fondo de luminosidad similar
   → Falla contraste.

❌ Números 01/02/03 como decoración de secciones cuando el contenido no es secuencial
   → Ruido visual sin significado.
```

---

## Checklist antes de entregar el código

- [ ] Paleta anclada en el rubro, no en una moda visual genérica
- [ ] Todos los pares texto/fondo verificados ≥ 4.5:1
- [ ] El accent (CTA) tiene contraste suficiente con su texto
- [ ] El display font NO es Inter/Roboto/Open Sans
- [ ] Existe un elemento firma identificable
- [ ] El layout mobile está contemplado (responsive mínimo 375px)
- [ ] No hay combinación de los 3 clichés de IA listados arriba

---

## Referencia de industrias

Lee `/references/industry-palettes.md` para puntos de partida de paleta y psicología visual por sector (salud, gastronomía, tecnología, educación, retail, servicios legales, belleza, deporte, bienes raíces, y más).
