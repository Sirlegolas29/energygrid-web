# EnergyGrid Web v3.0

Versión web del software de cálculo de mallas a tierra.

## Arquitectura
- **Frontend**: React 18, Vite, TailwindCSS (Hosteado en Cloudflare Pages)
- **Backend**: FastAPI, Python (Hosteado en Railway/Render)
- **Cálculos**: Se reutiliza el motor exacto de la versión de escritorio de EnergyGrid.

## Instrucciones para Despliegue

### 1. Backend (Railway / Render / VPS)
1. Conecta este repositorio a tu proveedor de hosting (ej. Railway).
2. Configura el directorio raíz a `/backend`.
3. El comando de inicio debe ser: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Define la variable de entorno `SECRET_KEY` para los JWT tokens.
5. Copia la URL del backend generado (ej. `https://api.tu-dominio.com`).

### 2. Frontend (Cloudflare Pages vía GitHub)
1. En tu repo de GitHub, ve a Settings > Secrets and variables > Actions.
2. Agrega las siguientes **Repository secrets**:
   - `VITE_API_URL`: La URL del backend (ej. `https://api.tu-dominio.com`)
   - `CLOUDFLARE_API_TOKEN`: Generado en tu panel de Cloudflare.
   - `CLOUDFLARE_ACCOUNT_ID`: El ID de tu cuenta de Cloudflare.
3. Al hacer push a la rama `main`, Github Actions compilará automáticamente el proyecto React y lo publicará en Cloudflare Pages.