# FoodMood IA - Frontend

Interfaz web de FoodMood IA: recetas reales según cómo te sientes, cuánto tiempo tienes y lo
que ya hay en tu cocina. React 19, Vite y Tailwind CSS v4, en español.

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173
```

El backend tiene que estar corriendo en `http://localhost:4000` (ver `../Back_FoodIA`). Vite hace
de proxy para `/api/*`, así que no hay CORS ni URLs que configurar en el navegador.

Si el backend vive en otra máquina:

```env
VITE_API_PROXY=http://192.168.1.50:4000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck y build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas de utilidades con `node:test` |

## Rutas

| Ruta | Pantalla |
|---|---|
| `/entrar` | Inicio de sesión y creación de cuenta |
| `/` | Inicio: ánimo rápido, resumen y herramientas |
| `/animo` | Cuestionario de ánimo, tiempo y antojo |
| `/chat` | Chat con IA sobre comida, dietas y el uso de la app |
| `/recetas` | Catálogo con búsqueda, filtros, orden, paginación y recetas nuevas con IA |
| `/recetas/:slug` | Receta completa, con adaptación, sustituciones y modo cocina |
| `/despensa` | Recetas a partir de los ingredientes que tienes |
| `/plan` | Plan de 3, 5 o 7 días con lista de compras |
| `/historial` | Recetas vistas o preparadas, con notas y calificaciones |
| `/favoritos` | Lista personal de recetas guardadas |
| `/perfil` | Preferencias, salud, perfil activo y actividad |

Las rutas antiguas `/recomendar`, `/catalogo` y `/plato/:slug` redirigen a sus equivalentes
actuales para no romper enlaces guardados.

## Qué hace la app

- **Cuentas con sesión**: con `/entrar` registras cuentas e inicias sesión con correo y contraseña; el token vive en `localStorage` y los datos privados (favoritos, historial, preferencias) siempre piden tu propia sesión. Sin cuenta puedes seguir mirando el catálogo.
- **Chat con IA** en `/chat`: Chef responde sobre comida, dietas y cómo usar FoodMood IA. La bienvenida resume los temas permitidos, sin recuadros de advertencia. Si la pregunta es de otro tema (una suma, una tarea, programación o el clima), el backend la rechaza antes de llamar al modelo y la interfaz la marca como **fuera de mi tema**. Si no hay proveedor o falla, el chat sigue respondiendo con el texto local.
- **Recomendación por ánimo** con seis estados, presupuesto de tiempo y antojo. Las respuestas
  principales quedan en la URL para poder refrescar o compartir la selección.
- **Catálogo sin tope fijo** con búsqueda por nombre o ingrediente, filtros por categoría, dieta,
  dificultad, tiempo y alérgenos; orden y paginación también viven en la URL. Incluye una tarjeta
  para pedir una receta nueva a la IA, que se valida y se guarda como una receta más.
- **Receta** con porciones ajustables, ingredientes recalculados, sustituciones verificadas,
  alérgenos, notas de seguridad, recetas parecidas y valoración.
- **Modo cocina** a pantalla completa, paso a paso, con notas de seguridad del paso actual y
  navegación por teclado.
- **Despensa** que cruza tus ingredientes con el catálogo y distingue entre recetas completas,
  casi completas y lo que te falta.
- **Plan de comidas** de 3, 5 o 7 días, con desayuno, almuerzo, cena y merienda, lista de compras
  copiable y regeneración.
- **Historial** editable: estado, calificación, nota y sensación; borrado por receta o completo.
- **Favoritos** con búsqueda, categoría, orden y elección aleatoria.
- **Perfil** con dieta, presupuesto, picante, objetivo calórico, alérgenos, ingredientes que no te
  gustan y condiciones de salud.

Las reglas duras de alergias, dieta y seguridad se validan en el backend. La app sigue funcionando
si el servicio de IA no está disponible: el catálogo, la despensa, el plan y el historial no
dependen de él.

## Estado y persistencia

`UserContext` carga los perfiles al arrancar y recuerda el activo en `localStorage`. Las pantallas
que guardan trabajo local usan `usePersistentState`:

- `foodmood.pantry.*`: ingredientes, tiempo, antojo y filtro de recetas completas.
- `foodmood.plan.*`: últimos ajustes y último plan generado.
- `foodmood.sidebarCollapsed`: estado de la barra lateral.

Nada del historial ni de los favoritos se guarda solo en el navegador: esas acciones pasan por la
API y el contexto refresca el estado compartido.

## Sistema de diseño

La paleta es cálida y de cocina, definida como tokens en `index.css` con `@theme`:

| Token | Valor | Uso |
|---|---|---|
| `cream-50/100/200` | `#FAF6EF` a `#F1E8DB` | Fondo y superficies suaves |
| `surface` | `#FFFDF9` | Tarjetas y paneles |
| `clay-500/600` | `#C9795D` / `#AE6149` | Acento principal y enlaces |
| `peach-100/200` | `#F2D8C9` a `#EBC9B6` | Selección, avisos y chips |
| `sage-100/200/400/500/600` | `#E8EDE2` a `#6F8064` | Estados correctos y seguridad |
| `ink` / `ink-soft` | `#44372F` / `#6D5F55` | Texto principal y secundario |
| `muted` | `#85776C` | Texto de apoyo |
| `line` | `#E9DED1` | Bordes y separadores |
| `danger-500/600` | `#B4573F` / `#96432F` | Errores y acciones destructivas |

Tipografías: **Lora** para títulos y **Inter** para el resto. No se usan fotografías ni emojis: las
miniaturas son gradientes por categoría con una ilustración SVG propia.

### gRPC

Además del REST, el backend expone **gRPC** (`foodmood.v1.FoodMoodStatus`: `GetStatus` y `GetDish`). El frontend lo habla sin dependencias nuevas:

- `src/lib/grpcFrames.ts` lee y escribe los frames gRPC-Web (`0x00` datos, `0x80` trailers con `grpc-status`).
- `src/lib/grpcProto.ts` decodifica las respuestas protobuf a mano (los números de campo del `.proto` son el contrato) y arma las peticiones, como `DishRequest { int32 id = 1 }`.
- `src/lib/grpcStatus.ts` llama con `fetch` al puente del backend (`POST /api/grpc/foodmood.v1.FoodMoodStatus/GetStatus`, pasa por el mismo proxy de Vite que el REST) y mapea los códigos gRPC a `GrpcError`.
- El rastro visible: el **badge del pie de página** ("gRPC activo · 40 platos · modelo local · v1.4.0"). Es silencioso a propósito: si el backend no tiene gRPC encendido, el badge no aparece y el resto de la app ni se entera.

## Acceso y registro

La pantalla `/entrar` permite iniciar sesión o crear una cuenta. Ambos formularios se validan en el navegador antes de llamar a la API:

- **Correo**: obligatorio, debe contener exactamente una `@` con usuario y un dominio con punto (por ejemplo `correo.com`), máximo 120 caracteres.
- **Contraseña**: obligatoria, entre 8 y 120 caracteres. Un indicador visual muestra la fortaleza mientras escribes (largo, mayúsculas, dígitos y símbolos).
- **Nombre a mostrar** (solo registro): obligatorio, entre 2 y 40 caracteres.

Si algún campo falla, se muestra un mensaje bajo el campo y el botón de envío queda desactivado hasta que todo sea válido. El backend valida de nuevo con Zod, así que las reglas se aplican dos veces: una para la experiencia de usuario y otra como control de seguridad.

## Accesibilidad y robustez

- Enlace "Saltar al contenido" y foco al bloque principal después de cada navegación.
- Controles con etiquetas, `aria-pressed` y regiones `aria-live` en filtros y resultados.
- Modo cocina con `role="dialog"`, cierre con Escape, flechas para avanzar y foco devuelto al botón
  que lo abrió.
- `ErrorBoundary` dentro del layout y en la raíz: si una pantalla falla, la navegación sigue viva.
- Skeletons, estados vacíos y de error con reintento en todas las cargas.
- Estilos de impresión: la receta sale limpia, sin barra lateral, navegación ni botones.

## Estructura

```text
src/
  App.tsx                 Rutas, redirecciones y 404
  main.tsx                Entrada, router y límites de error
  index.css               Tokens, primitivas visuales y estilos de impresión
  types.ts                Tipos compartidos con la API
  lib/                    Cliente HTTP, formato y utilidades de texto
  context/                Perfil, favoritos, historial y salud
  hooks/                  Carga asíncrona, debounce, toasts y persistencia
  components/             Layout, navegación, tarjetas, paneles y modo cocina
  pages/                  Una página por ruta
tests/                    Pruebas de utilidades con node:test
```

## Pruebas

```bash
npm test
```

Cubren el formato de fechas, porcentajes, porciones y calorías, los visuales por categoría, la
normalización de ingredientes escritos a mano, las utilidades del chat (bienvenida, alcance,
historial enviado al backend y límite del mensaje) y los límites de la idea que se pide a la IA. El typecheck y el build se ejecutan aparte:

```bash
npm run typecheck
npm run build
```
