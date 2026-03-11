# BackerPost (PoC)

BackerPost es una aplicación web estática (client-side only) para convertir un CSV de backers de Kickstarter en:

1. `envios_normalizados.csv`
2. `correos_s0410.txt` (perfil único `S0410 / PAQ STANDARD INTERNACIONAL`)
3. `incidencias.csv`
4. `rechazados.csv`
5. `proyecto-backerpost.json` (opcional)

Toda la UI está en español y todo el procesamiento ocurre en el navegador.

## Qué hace

- Importa un CSV de Kickstarter (drag & drop + selector)
- Sugiere mapeo de columnas y permite confirmarlo/editarlo
- Aplica normalización determinista de direcciones y campos
- Valida filas separando bloqueos y avisos
- Permite corregir filas desde panel lateral y revalidar
- Exporta en modo estricto o asistido
- Persiste sesión local en `localStorage`
- Permite importar/exportar proyecto JSON

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- Zustand (estado local + persistencia)
- Zod (validación de snapshot de proyecto)
- Papa Parse (CSV)
- Vitest + Testing Library

## Estructura principal

- `src/features/import`: importación CSV/proyecto
- `src/features/mapping`: mapeo de columnas + configuración de lote
- `src/features/validation`: normalización y validación
- `src/features/review`: revisión, filtros y correcciones
- `src/features/export`: exportadores CSV/TXT/JSON
- `src/lib/correos`: pipeline exportador (perfil + adaptador + serializer)
- `src/lib/countries`: mapeador local de países
- `src/store`: estado global persistente
- `fixtures/`: CSV de ejemplo

## Privacidad

- No hay backend
- No hay base de datos
- No hay autenticación
- No hay llamadas a APIs externas
- No hay analytics ni telemetría
- Los archivos se procesan localmente en el navegador

## Uso con Docker (sin npm local)

Requisitos: Docker instalado.

### Instalar dependencias

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:20 npm install
```

### Desarrollo

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$PWD":/app -w /app -p 5173:5173 node:20 npm run dev -- --host 0.0.0.0
```

### Tests

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:20 npm run test
```

### Build

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:20 npm run build
```

### Preview

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$PWD":/app -w /app -p 4173:4173 node:20 npm run preview -- --host 0.0.0.0
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:watch`

## GitHub Pages

El proyecto ya incluye CI y despliegue automático en GitHub Pages:

- CI: `.github/workflows/ci.yml`
- Deploy Pages: `.github/workflows/deploy-pages.yml`

### Qué adapta el código para Pages

- `vite.config.ts` usa `VITE_BASE_PATH` (por defecto `/`).
- En GitHub Actions se calcula automáticamente:
  - repositorio tipo `usuario.github.io` -> `/`
  - resto de repositorios -> `/<nombre-repo>/`

### Activación

1. Sube `main` a GitHub.
2. En GitHub: `Settings -> Pages -> Build and deployment -> Source: GitHub Actions`.
3. Haz push a `main` (o lanza `workflow_dispatch`) y se publicará en Pages.

## Limitaciones actuales del PoC

- Exportador TXT modelado para un único perfil (`S0410`) con layout configurable en código.
- El formato TXT implementado es determinista y modular, pero puede requerir ajuste fino si Correos cambia especificaciones exactas de Mi Oficina.
- El mapeo de países usa un catálogo local reducido (fácil de ampliar).
- No hay deduplicación ni integración con APIs externas.
- No se incluyen funcionalidades fuera del alcance (tracking, compra de etiquetas, etc.).
