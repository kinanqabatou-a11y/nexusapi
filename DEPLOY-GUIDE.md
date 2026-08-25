# Guia de Deploy - NexusAPI

## PASO 1: Crear cuenta en GitHub

1. Ve a https://github.com
2. Click "Sign up"
3. Crea una cuenta gratuita

## PASO 2: Instalar Git

1. Ve a https://git-scm.com/download/win
2. Descarga e instala Git para Windows
3. Durante la instalación, deja todas las opciones por defecto
4. Reinicia la terminal

## PASO 3: Crear repositorio en GitHub

1. En GitHub, click "New repository"
2. Nombre: `nexusapi`
3. Selecciona "Public"
4. Click "Create repository"

## PASO 4: Subir el codigo

Abre una terminal nueva y ejecuta:

```bash
cd "C:\Users\lharb\OneDrive\Documentos\Default Project\autoapi"

git init
git add .
git commit -m "Initial commit - NexusAPI platform"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/nexusapi.git
git push -u origin main
```

(Reemplaza TU-USUARIO con tu usuario de GitHub)

## PASO 5: Deploy del Backend en Railway

1. Ve a https://railway.app
2. Click "Login" -> "Login with GitHub"
3. Click "New Project" -> "Empty Service"
4. Click "GitHub Repo" -> selecciona tu repo `nexusapi`
5. En "Settings":
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Port: 8000
6. En "Variables", agrega:
   ```
   DATABASE_URL=sqlite:///./autoapi.db
   JWT_SECRET=tu-secreto-super-seguro-aqui
   JWT_ALGORITHM=HS256
   APP_ENV=production
   APP_DEBUG=false
   FRONTEND_URL=https://nexusapi.vercel.app
   ```
7. Railway te dara una URL como: `https://nexusapi-backend.up.railway.app`
8. Copia esa URL

## PASO 6: Deploy del Frontend en Vercel

1. Ve a https://vercel.com
2. Click "Sign Up" -> "Continue with GitHub"
3. Click "Add New Project"
4. Importa tu repositorio `nexusapi`
5. En "Configure Project":
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npx next build --webpack`
   - Output Directory: `.next`
6. En "Environment Variables", agrega:
   ```
   NEXT_PUBLIC_API_URL=https://nexusapi-backend.up.railway.app
   ```
7. Click "Deploy"
8. Espera 2-3 minutos
9. Vercel te dara una URL como: `https://nexusapi.vercel.app`

## PASO 7: Configurar Google Search Console

1. Ve a https://search.google.com/search-console
2. Click "Start now"
3. Inicia sesion con tu cuenta de Google
4. Selecciona "URL prefix"
5. Escribe tu URL: `https://nexusapi.vercel.app`
6. Click "Continue"
7. Verifica la propiedad por uno de estos metodos:
   - **Recomendado**: HTML tag -> copia el meta tag
8. En tu proyecto, agrega el meta tag en `src/app/layout.tsx` dentro de `<head>`
9. Vuelve a Search Console y click "Verify"
10. Click "Go to property"

## PASO 8: Enviar sitemap a Google

1. En Google Search Console, ve a "Sitemaps" (menu izquierdo)
2. En "Add a new sitemap", escribe: `sitemap.xml`
3. Click "Submit"
4. Google empezara a indexar tu pagina en 1-7 dias

## PASO 9: Solicitar indexacion manual

1. En Google Search Console, ve a "URL Inspection"
2. Escribe la URL de tu pagina: `https://nexusapi.vercel.app`
3. Click "Request Indexing"
4. Repite para las paginas principales:
   - https://nexusapi.vercel.app
   - https://nexusapi.vercel.app/docs
   - https://nexusapi.vercel.app/register
   - https://nexusapi.vercel.app/contact

## PASO 10: Verificar indexacion

Despues de 2-7 dias:
1. En Google, busca: `site:nexusapi.vercel.app`
2. Deberias ver tus paginas indexadas
3. Busca "NexusAPI" en Google
4. Tu pagina deberia aparecer

## TIPS PARA MEJORAR EL SEO

1. **Velocidad**: Vercel automaticamente optimiza, pero asegurate de que las imagenes sean ligeras
2. **Contenido**: Escribe blog posts sobre APIs y automatizacion
3. **Backlinks**: Comparte tu proyecto en redes sociales, foros, etc.
4. **Google Business**: Crea un perfil si tienes oficina
5. **Social Media**: Crea perfiles en Twitter, LinkedIn, GitHub
6. **Analytics**: Agrega Google Analytics en tu layout.tsx

## VARIABLES DE ENTORNO REQUERIDAS

### Backend (Railway)
- DATABASE_URL
- JWT_SECRET
- JWT_ALGORITHM
- APP_ENV
- APP_DEBUG
- FRONTEND_URL

### Frontend (Vercel)
- NEXT_PUBLIC_API_URL (URL del backend en Railway)
