# NoobAI

Chat de IA sin restricciones (Qwen Coder) + Panel de inteligencia de amenazas con reportes de grupos hackers de Telegram/Discord.

## Stack

- **Next.js 14** (Pages Router)
- **OpenRouter API** — acceso a Qwen Coder 32B y otros modelos
- **Vercel** — deploy con un click

---

## Despliegue en Vercel desde GitHub

### 1. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/noob-ai.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio `noob-ai`
3. En **Environment Variables**, agrega las siguientes:

| Variable | Valor |
|---|---|
| `OPENROUTER_API_KEY` | Tu key de [openrouter.ai/keys](https://openrouter.ai/keys) |
| `ADMIN_USERNAME` | El usuario del panel admin |
| `ADMIN_PASSWORD` | Contraseña fuerte para el admin |
| `ADMIN_SECRET` | String aleatorio largo (ej: `openssl rand -hex 32`) |

4. Click en **Deploy**

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env.local

# 3. Editar .env.local con tus valores reales

# 4. Correr en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Chat de IA con Qwen Coder — sin filtros |
| `/admin` | Panel de inteligencia de amenazas (requiere login) |

---

## Modelos disponibles en el chat

- Qwen2.5 Coder 32B *(default)*
- Qwen2.5 72B
- Qwen2.5 Coder 7B (rápido)
- QwQ 72B Preview
- DeepSeek R1
- DeepSeek V3

---

## Credenciales admin por defecto

Si no configuras las env vars, las credenciales por defecto son:
- **Usuario:** `admin`
- **Contraseña:** `noobai2024`

**Cámbialas siempre antes de hacer deploy.**
