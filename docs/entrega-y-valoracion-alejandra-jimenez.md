# Liquidación y entrega técnica  
## Proyecto web — Alejandra Jimenez

**Fecha:** 6 de agosto de 2026  
**Proyecto:** Sitio web de artista + panel de administración (CMS)  
**Acuerdo original:** 540 € (desarrollo, diseño en conjunto, planificación, reuniones semanales, deploy y entrega)  
**Objeto de este documento:** liquidación por el trabajo realizado y transferencia completa del activo técnico para continuidad del proyecto con un nuevo desarrollo.

---

## 1. Resumen

Se entrega el código fuente, la base de datos, el stack tecnológico y la documentación necesaria para continuar el sitio.

El núcleo del sistema —sitio público, CMS, autenticación, almacenamiento, posicionamiento libre de obras, home interactivo y esquema de base de datos— está construido y operativo en código. Quedan pendientes partes de diseño, un modo adicional de proyectos, el diseño específico de algunas secciones y el cierre de la lógica de anotaciones, además del deploy final y la carga de contenido definitivo.

**Monto de liquidación:** **450 €**  
(dentro del acuerdo de 540 €; se descuenta lo no cerrado del paquete original)

La entrega del código y la base de datos se realiza contra el pago de esta liquidación.

---

## 2. Alcance del acuerdo original (540 €)

El precio pactado cubría:

- Desarrollo de la web y del panel de administración
- Diseño en conjunto con la artista (dirección visual y representatividad del sitio)
- Planificación de una web que represente el trabajo y el estudio
- Reuniones semanales de seguimiento
- Deploy en producción y entrega

Este documento liquida lo ya hecho y transfiere lo construido para que el proyecto pueda continuar sin empezar de cero.

---

## 3. Inventario de lo construido

### 3.1 Sitio público

| Sección | Estado | Descripción |
|--------|--------|-------------|
| **Home** | Construida | Home de doble panel con fotos del estudio. Objetos del estudio se pueden delinear como zonas clicables (hotspots) que llevan a Projects, Paintings, Texts, Sounds y About. Efecto de remarcado al pasar el cursor. |
| **Projects** | Construida (base) | Índice de proyectos y fichas por proyecto. Dos modos de visualización implementados (ver abajo). |
| **Paintings** | Estructura lista | Galería de pinturas seleccionadas, conectada al CMS. Diseño editorial final pendiente. |
| **Texts** | Estructura lista | Puerta a textos / Substack (título, extracto, enlace, embed opcional). Diseño de sección pendiente. |
| **Sounds** | Estructura lista | Listado de pistas con reproductor de audio. Diseño de sección pendiente. |
| **About** | Construida (base) | Bio, retrato, email e Instagram, editables desde el admin. |

Navegación compartida y tipografía editorial (EB Garamond + IBM Plex Mono) aplicadas en el sitio.

### 3.2 Modos de proyecto (parte central del trabajo)

**Design A — composición libre**

- En el admin: colocar y redimensionar obras sobre un lienzo (posiciones en porcentaje).
- En el sitio: misma composición en escritorio; apilado claro en móvil.
- Al hacer clic en una obra se abre un carrusel / lightbox con las fotos de esa obra.

**Design B — muro de estudio con notas**

- Obra centrada + notas / escaneos de proceso posicionables alrededor.
- Editor en el admin para subir y ubicar esas notas.
- Vista pública adaptada a móvil.

Estos dos modos no son plantillas genéricas: son lógica a medida (canvas libre, persistencia en base de datos, vista pública y admin).

### 3.3 Panel de administración (CMS)

Sistema propio para que la artista (o quien continúe) gestione el sitio sin tocar código:

- Login seguro (Supabase Auth, email y contraseña)
- Protección de todas las rutas `/admin/*`
- **Hero / hotspots del home:** herramienta para trazar el contorno de objetos sobre las fotos del estudio, asignar enlace (Projects, Paintings, etc.) y guardar en base de datos
- **Proyectos:** crear, editar, eliminar; elegir Design A o B; gestionar obras, imágenes de portada y carrusel
- **Canvas Design A:** editor visual arrastrar / redimensionar
- **Notas Design B:** editor visual de notas alrededor de la obra
- **Paintings, Texts, Sounds, About:** alta y gestión de contenido desde el panel
- **Subida de archivos** a almacenamiento en la nube (imágenes con reducción de tamaño automática; audio sin esa reducción)

### 3.4 Backend y base de datos (Supabase)

Proyecto preparado con:

- Autenticación de administrador
- Almacenamiento público de uploads (`uploads`)
- Esquema SQL en 8 archivos ordenados, con políticas de seguridad (lectura pública / escritura autenticada), incluyendo:
  - páginas y elementos de canvas libre
  - ajustes del sitio (about / contacto)
  - proyectos y modo de visualización
  - obras e imágenes de obra
  - notas de proyecto (Design B)
  - paintings, texts, sounds
  - hotspots del home (panel, puntos del polígono, enlace, nota de objeto)

Sin este bloque, el sitio no tendría CMS real ni continuidad fácil para otra persona.

### 3.5 Stack tecnológico entregado

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 + variables de diseño propias |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Deploy previsto | Vercel + repositorio GitHub |
| Repositorio | Git hub |

Código organizado entre:

- núcleo reutilizable (`auth`, clientes Supabase, upload, admin, free-canvas)
- dominio del sitio de Alejandra (páginas públicas, componentes, CMS específico)

---

## 4. Valor de lo entregado

El entregable es una aplicación web full-stack a medida, no un sitio estático ni un CMS genérico. Incluye:

1. **Arquitectura Next.js 15 + Supabase** — App Router, TypeScript, autenticación con sesión protegida, Storage para media, Postgres con RLS y esquema versionado en migraciones SQL.
2. **CMS propio** — panel admin con CRUD de proyectos, obras, paintings, texts, sounds y about; upload de archivos; editores visuales de canvas (drag/resize en coordenadas relativas %).
3. **Hero interactivo del estudio (hotspots)** — home de doble panel con selección de objetos por contorno: polígonos SVG en espacio normalizado 0–100, glow al hover/focus, y admin tracer (click-to-trace, undo, persistencia de `points` + destino de navegación en Postgres). No es un mapa de áreas rectangular: es un sistema de hit-testing por forma libre acoplado al CMS.
4. **Lógica de presentación custom** — Design A (composición libre + lightbox/carrusel) y Design B (obra centrada + notas posicionables).
5. **Dirección de producto ya definida** — information architecture, modos de proyecto, home del estudio y mapa de secciones listos para iterar diseño y contenido encima.

Este núcleo —backend, CMS, hero con hotspots, editores y viewers— concentra el costo real del desarrollo del acuerdo. La liquidación refleja eso.

---

## 5. Qué queda por hacer (honesto)

Para no confundir “sistema construido” con “sitio cerrado”:

- **Diseño general del sitio** — falta cerrar y pulir la dirección visual en conjunto (no solo tipografía y estructura base).
- **Otro diseño de proyectos** — además de Design A y Design B, estaba previsto un modo / diseño adicional que no está implementado.
- **Sección Sounds** — estructura y CMS listos; falta el diseño de la sección.
- **Sección Texts** — estructura y CMS listos; falta el diseño de la sección.
- **Anotaciones a los costados de las pinturas** — hay base técnica de notas posicionables (Design B); falta cerrar la lógica y la experiencia completa pensada para esas anotaciones.
- **Contenido definitivo** — obras reales, textos, sonidos, fotos finales, hotspots afinados con el material definitivo.
- **Deploy y cierre** — publicación final en producción, revisión de entrega y reuniones de cierre del paquete original.

Estos puntos justifican **no** liquidar los 540 € completos.

---

## 6. Entrega técnica incluida

Contra el pago de la liquidación se entrega:

1. **Código fuente** — acceso al repositorio GitHub del proyecto.
2. **Base de datos Supabase** — proyecto, esquema, storage y usuario admin (transferencia de ownership / accesos según cómo esté configurado al momento del pago).
3. **Este documento** de liquidación y valoración.
4. **Documento guía de continuidad** — enviaremos una guía aparte que explique la estructura del repo, el panel admin, el stack, la base de datos, próximos pasos, y las bases / cuidados para no romper el sistema al continuar el desarrollo.

---

## 7. Liquidación

| Concepto | Relación con el acuerdo |
|----------|-------------------------|
| Desarrollo del sitio público + CMS + backend | Entregado (núcleo) |
| Design A y Design B (base) + home con hotspots | Entregado |
| Planificación y diseño en conjunto ya realizados | Entregado (parcial respecto al cierre visual) |
| Transferencia de código, DB y documentación | Incluida |
| Diseño pendiente, modo de proyecto faltante, anotaciones, sounds/texts, reuniones restantes, deploy/cierre | No incluido → descontado |

| | |
|--|--|
| **Acuerdo original** | 540 € |
| **Descuento por lo no cerrado** | 90 € |
| **Total a liquidar** | **450 €** |

Equivalente orientativo en ARS (según la equivalencia usada en el acuerdo ~900.000 ARS ≈ 540 €): **≈ 750.000 ARS**.

---

## 8. Condiciones de entrega

1. Confirmación de aceptación de esta liquidación (**450 €**).  
2. Pago de la liquidación.  
3. Entrega de accesos: repositorio GitHub, proyecto Supabase y Vercel, más este documento y la guía de continuidad.  

---

## 9. Cierre

El proyecto no se entrega “vacío”: se entrega un sistema con sitio, administración, base de datos y las piezas específicas ya construidas (composición libre, notas de proceso, home del estudio).  
Tampoco se presenta como cerrado: faltan diseño, un modo de proyectos, el cierre de anotaciones y la publicación final.

**Liquidación: 450 €.**  
A cambio: código, stack, base de datos y guía para continuar.



—
