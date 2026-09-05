# Guía de uso — Panel Admin  
**Sitio de Alejandra Jimenez**

Documento para gestionar el contenido del sitio sin tocar código.

---

## Cómo entrar

1. Abrí la dirección del admin que te dieron (termina en `/admin`).
2. Iniciá sesión con tu email y contraseña.
3. Vas a ver el menú: **Home · Hero · Projects · Paintings · Texts · About**.

**Tip:** después de guardar, abrí el sitio público en otra pestaña para revisar cómo quedó.

---

## Mapa rápido

| Sección del admin | Qué controla en el sitio |
|---|---|
| **Hero** | Foto(s) de la portada (página de inicio) |
| **Projects** | Proyectos: lista + composición libre de obras |
| **Paintings** | Selected paintings: grupos (años) + composición libre |
| **Texts** | Textos / escritos publicados |
| **About** | Bio, contacto, CV y retrato |

---

## Hero (portada)

La primera imagen que ve quien entra al sitio.

### Layouts
- **Two photos** — dos imágenes (izquierda y derecha).
- **One full-screen photo** — una sola imagen a pantalla completa.

Podés subir las tres imágenes y cambiar de layout cuando quieras.

### Cómo hacerlo
1. Elegí el layout.
2. Subí la(s) foto(s) con **Upload**.
3. Pulsá **Save**.

Para quitar una imagen: **Remove image** → **Save**.

---

## Projects

Cada proyecto tiene:
1. **Datos** (título, año, lugar, texto).
2. **Works** (obras / piezas del proyecto).
3. **Free canvas** (dónde se colocan las imágenes en la página).

### Crear un proyecto
1. **Projects** → escribí el título → **Create**.
2. Entrá al proyecto (se abre solo).
3. Completá **Details** → **Save details**.

### Agregar una obra (Work)
1. En **Works**, escribí el título → **Add work**.
2. Completá año y medium (se guardan al salir del campo).
3. **+ Photo** — subí una o más fotos de esa obra.  
   (Varias fotos = carrusel cuando el visitante abre la obra en grande.)

### Notas de estudio (por obra)
Las notas **no** van en la página general: aparecen cuando alguien hace click en la obra y se abre a pantalla completa.

1. Primero subí al menos una foto de la obra.
2. **Cargar notas**.
3. **+ Add note image** — conviene PNG con fondo transparente.
4. Arrastrá y redimensioná las notas alrededor de la pintura (mejor en computadora).
5. **Save notes**.

### Ficha técnica (por obra)
Texto fijo debajo de la pintura al abrirla en grande (medidas, técnica, etc.).

1. **Cargar ficha técnica**.
2. Escribí el texto → **Save**.  
   (También podés borrarla desde ese mismo panel.)

### Free canvas (composición del proyecto)
Es la “pared” del proyecto en la web: posicionás las imágenes a mano.

1. **Place work on canvas…** → elegí una obra → **Place**.  
   (La obra tiene que tener foto.)
2. Opcional: **+ Upload image** para una imagen suelta (sin obra asociada).
3. Arrastrá, redimensioná.
4. **Save canvas** — importante: si no guardás, se pierde el cambio.

### Borrar
- Una obra: **Delete** en esa obra.
- Todo el proyecto: en la lista de Projects → **Delete** (borra obras, notas y canvas).

---

## Paintings (Selected paintings)

Funciona **igual que Projects**, pero organizado por **grupos** (por ejemplo un año: “2024”).

### Flujo típico
1. **Paintings** → título del grupo (ej. `2024`) → **Create**.
2. Completá los datos del grupo → **Save**.
3. Agregá pinturas, fotos, notas y ficha técnica (mismos botones que en Projects).
4. Colocá las piezas en el **Free canvas** → **Save canvas**.

En el sitio público: lista de grupos → al entrar, la composición libre de ese grupo.

---

## Texts

Publicar escritos en el sitio (lista + página de cada texto).

### Publicar
1. **Title** (obligatorio).
2. **Short text** — resumen para la lista (opcional).
3. **Full text** — texto completo (obligatorio).
4. **Published date** — opcional (`YYYY-MM-DD`).
5. **Publish text**.

Hoy el admin permite **publicar** y **borrar**. No hay edición: si hay que corregir, borralo y volvé a publicar.

---

## About

Página de la artista.

| Campo | Qué es |
|---|---|
| **Bio** | Texto principal |
| **Email** | Correo (aparece como link) |
| **Instagram URL** | Link completo a Instagram |
| **CV (PDF)** | Subís un PDF; en el sitio aparece el link “CV” |
| **About portrait** | Foto / retrato |

Al terminar: **Save**.  
Para sacar el CV: **Remove CV** → **Save**.

---

## Cómo se ve lo que cargás (visitante)

| En el admin | En el sitio público |
|---|---|
| Hero | Portada `/` |
| Proyecto + canvas | `/projects` → página del proyecto |
| Click en una obra del canvas | Lightbox: fotos, notas y ficha técnica |
| Grupo de Paintings | `/paintings` → página del grupo |
| Texts | `/texts` → cada texto |
| About | `/about` |

---

## Consejos prácticos

- **Siempre guardá** con el botón Save de esa sección (details, canvas, notes, ficha, hero, about).
- Fotos: mejor calidad, pero no hace falta archivos enormes; el sistema las optimiza.
- Notas: PNG transparente se ve más limpio.
- Posicionar notas y canvas: más cómodo en **computadora** que en el celular.
- Revisá el resultado en el sitio público después de cada cambio importante.

---

## Si algo no aparece

1. ¿Pulsaste **Save**?
2. ¿Refrescaste la página pública?
3. ¿La obra tiene al menos una foto? (hace falta para colocarla en el canvas y para las notas).
4. Si el problema sigue, contactá a quien te entregó el sitio.

---

*Versión alineada al admin actual (free canvas + notas y ficha por obra).*
