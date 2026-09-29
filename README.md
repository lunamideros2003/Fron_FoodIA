# FoodMood IA — Frontend

Interfaz web de FoodMood IA. React 19 + Vite + Tailwind CSS v4, en español.

## Arranque

```bash
npm install
npm run dev        # http://localhost:5173
```

El backend debe estar corriendo en `http://localhost:4000` (ver `../Back_FoodIA`). El servidor de
Vite hace de proxy: todo lo que pida a `/api/*` lo reenvía al backend, así que no hay CORS ni URLs
que configurar.

Si el backend está en otra parte:

```env
VITE_API_PROXY=http://192.168.1.50:4000
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build |
| `npm run typecheck` | `tsc --noEmit` |

## Estructura

```
src/
├── main.tsx              Punto de entrada
├── App.tsx               Rutas
├── index.css             Tokens de diseño (Tailwind v4 @theme)
├── types.ts              Tipos que reflejan la respuesta de la API
├── lib/
│   ├── api.ts            Cliente HTTP tipado
│   └── format.ts         Fechas, porcentajes y visuales por categoría
├── context/
│   └── UserContext.tsx   Perfil activo, historial y registro de interacciones
├── hooks/
│   ├── useAsync.ts       Carga de datos con cancelación de respuestas viejas
│   └── useApi.ts         Envoltorio de useAsync
├── components/
│   ├── Layout.tsx              Navegación, selector de perfil y footer
│   ├── MoodCard.tsx            Tarjeta de estado de ánimo
│   ├── DishCard.tsx            Tarjeta de plato con desglose de puntaje
│   ├── DishThumb.tsx           Miniatura por gradiente
│   ├── DishIllustration.tsx    Ilustraciones SVG por categoría
│   ├── HealthQuestionnaire.tsx Cuestionario de condiciones de salud
│   ├── RecipeView.tsx          Receta completa: ingredientes, pasos, consejo
│   ├── BalanceStep.tsx         Plan del resto del día
│   ├── icons.tsx               Set de iconos SVG
│   └── Feedback.tsx            Skeletons, estados vacío y de error
└── pages/
    ├── HomePage.tsx          Portada
    ├── RecommendPage.tsx     El flujo completo
    ├── CatalogPage.tsx       Los 40 platos con filtros
    ├── DishDetailPage.tsx    Ficha, receta, ejes y similares
    └── ProfilePage.tsx       Preferencias, salud, historial y estado del modelo
```

## Sistema de diseño

La paleta sale de la imagen de referencia: una pastelería en tonos rosa empolvado. Todo está
definido como tokens en `index.css` con `@theme`, sin archivos de configuración aparte.

| Token | Valor | Uso |
|---|---|---|
| `cream-50/100/200` | `#FDFAF6` … `#F5EBE1` | Fondos y superficies |
| `sand-100/200/300` | `#F6ECE2` … `#E4CDBC` | Bordes y separadores |
| `blush-100/200/300/400` | `#FBE9EA` … `#E09AA6` | Fondos de estado, chips |
| `rose-200/300/400/500` | `#DDAAB6` … `#B08494` | Acento principal |
| `mauve-400/500/600` | `#9A6C7C` … `#6E4650` | Botones, títulos |
| `plum-700/800` | `#5A3941` … `#452C33` | Encabezados |
| `cocoa-500/600/700` | `#7C5A5C` … `#3E2A2C` | Texto |
| `gold-300/400/500` | `#E0C08D` … `#AC8A52` | Acento cálido, consejos |
| `sage-300/400/500` | `#B6CFC1` … `#6F907E` | Acento secundario, "bajo control" |

Tipografías: **Fraunces** para títulos (serif, con carácter) y **Outfit** para el resto.

### Sin emoji, y sin fotografías

El catálogo no tiene fotos de platos, y los emojis no eran la solución: se ven distintos en cada
sistema operativo, rompen la paleta y hacen que la interfaz parezca inacabada.

Hay dos piezas dibujadas a mano en su lugar:

- **`DishIllustration.tsx`** — una ilustración SVG por categoría (huevo, bol, plato, taza, pastel,
  vaso) en trazo plano, sobre un gradiente cuyo ángulo depende del id del plato
- **`icons.tsx`** — 18 iconos de línea que heredan `currentColor`

Los únicos emoji que quedan en pantalla son los **seis estados de ánimo**, porque son parte del
enunciado del caso de estudio y son lo que el usuario tiene que elegir.

## El flujo de recomendación

`RecommendPage` guía en cuatro pasos visibles:

1. **Estado de ánimo** — seis tarjetas; se puede llegar por URL (`?mood=sad`)
2. **Detalles** — nota libre, tiempo máximo y dieta; la nota acepta atajos (`?nota=algo+calientito`)
   y frases rápidas
3. **Salud** — el cuestionario aparece solo cuando el backend dice que hace falta
   (`needsHealthInfo`), o cuando el usuario lo pide. Guardarlo en el perfil lo vuelve a filtrar
   siempre, sin volver a preguntar
4. **Resultado** — narrativa del modelo, tarjetas con el desglose del puntaje, alternativas, y el
   botón **"Lo quiero, ver receta"**

Elegir un plato abre la **receta completa** (ingredientes en texto plano, pasos numerados, consejo,
nutrición por porción) y ahí se pregunta **cuántas porciones**. Al confirmar se registra el consumo
y se pasa al **balance del día**.

`DishCard` trae el porcentaje de ajuste, la explicación del modelo, botones de calificar, guardar y
"No es para mí", y un panel "Por qué te lo recomienda" con los siete canales y los rasgos que más
pesaron.

## Estado y datos

`UserContext` carga los perfiles al arrancar y recuerda el activo en `localStorage`. Si la API no
responde, la interfaz sigue funcionando y muestra una banda de aviso con la instrucción de
arrancar el backend, en lugar de romperse en blanco.

Las interacciones se registran de forma optimista: el modelo responde en milisegundos, así que
esperar al round-trip se sentiría lento.

## Idioma

Todo el código está en inglés (nombres, funciones, tipos, comentarios). Todo lo que ve el usuario
está en español. Los datos de ejemplo son de español de México.
