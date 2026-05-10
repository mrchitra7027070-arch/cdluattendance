# CDLU Attendance System

A full-stack attendance management app built with React, Vite, Express, and MongoDB.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add your MongoDB Atlas URI:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
npm start
```

## Render Settings

Use these settings when creating the Render Web Service:

```txt
Build Command: npm install && npm run build
Start Command: npm start
```

Environment variables:

```txt
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
```
