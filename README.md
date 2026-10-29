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
| `/recetas` | Catálogo con búsqueda, filtros, orden y paginación |
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
- **Recomendación por ánimo** con seis estados, presupuesto de tiempo y antojo. Las respuestas
  principales quedan en la URL para poder refrescar o compartir la selección.
- **Catálogo** de 40 recetas con búsqueda por nombre o ingrediente, filtros por categoría, dieta,
  dificultad, tiempo y alérgenos; orden y paginación también viven en la URL.
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

Cubren el formato de fechas, porcentajes, porciones y calorías, los visuales por categoría y la
normalización de ingredientes escritos a mano. El typecheck y el build se ejecutan aparte:

```bash
npm run typecheck
npm run build
```
