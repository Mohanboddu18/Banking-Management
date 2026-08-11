# 🌐 Angular 19 Frontend Deployment Guide

This guide explains how to configure and deploy the **Godavari Bank Angular 19 Frontend** to free cloud hosting platforms (**Vercel**, **Netlify**, or **Render Static Site**) and connect it with your deployed Render backend.

---

## 1. Configure Production API URL

In `frontend/src/environments/environment.prod.ts` (or update `auth.service.ts` / API services):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://godavari-bank-backend.onrender.com/api' // Replace with your live Render backend URL
};
```

---

## 2. Deploy on Vercel (Recommended — 1-Click)

1. Push your code to GitHub.
2. Sign in to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the project configuration:
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`
5. Ensure `vercel.json` exists in `frontend/vercel.json` for SPA deep link routing:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```
6. Click **Deploy**!

---

## 3. Deploy on Netlify

1. Log in to [netlify.com](https://www.netlify.com/).
2. Click **"Add new site"** $\to$ **"Import an existing project"**.
3. Select your repository and specify:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist/frontend/browser`
4. Add a `_redirects` file in `frontend/public/_redirects`:
```
/*    /index.html   200
```
5. Click **Deploy Site**!

---

## 4. Deploy on Render (Static Site)

1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** $\to$ **Static Site**.
2. Select your repository.
3. Configure settings:
   - **Name**: `godavari-bank-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/frontend/browser`
4. Add a Rewrite Rule in Render Dashboard:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Click **Create Static Site**!
