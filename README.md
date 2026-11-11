# FoodMood IA — Frontend

Interfaz web de FoodMood IA, una app que recomienda recetas según cómo te sientes, cuánto tiempo tienes y lo que ya hay en tu cocina.

El backend está en otro repositorio: [Back_FoodIA](https://github.com/lunamideros2003/Back_FoodIA).

## Qué incluye

- Inicio y cuestionario de ánimo.
- Catálogo con búsqueda, filtros, orden y paginación.
- Recetas nuevas generadas con IA.
- Detalle de receta, sustituciones, alérgenos y modo cocina.
- Despensa: recetas con lo que ya tienes.
- Plan de comidas de 3, 5 o 7 días con lista de compras.
- Chat sobre comida, dietas y uso de la app.
- Favoritos, historial y perfil con preferencias y salud.

## Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router

## Cómo correrlo

Primero hay que tener el backend corriendo en `http://localhost:4000`.

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`. Vite redirige `/api/*` al backend, así que no hay que configurar CORS en local.

Si el backend está en otra máquina, se puede cambiar en `.env`:

```env
VITE_API_PROXY=http://192.168.1.50:4000
```

## Variables de entorno

Copia `.env.example` a `.env`.

```env
# Vacío usa el proxy local de Vite.
VITE_API_BASE_URL=

# Solo si el backend no está en localhost.
VITE_API_PROXY=http://localhost:4000
```

## Pruebas y build

```bash
npm test
npm run typecheck
npm run build
```

El build de producción queda en `dist/`.

## Despliegue

- Frontend: Vercel → `https://fron-food-ia.vercel.app`
- Backend: Render → `https://back-foodia.onrender.com`
