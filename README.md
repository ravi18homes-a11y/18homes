This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started.  

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Environment variables and local backend setup 🔧

- Frontend (Next.js):
  - Create a file `.env.local` at the project root and add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

- The frontend will use `process.env.NEXT_PUBLIC_API_BASE_URL` (exposed to client code) to send auth and API requests.

- Backend (API server) - separate process (Express / Node):
  - Copy `.env.example` to your backend repo or a `.env` file and set real secrets:

```env
PORT=5000
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.dxxn4on.mongodb.net/18homes?appName=Cluster0"
JWT_SECRET=supersecretkey
```

- **Do not commit** `.env` with real credentials. Use `.env.example` for reference only.

- Quick test:
  1. Start your backend on port 5000 (make sure it reads `process.env.PORT`, `process.env.MONGO_URI` and `process.env.JWT_SECRET`).
  2. Start the Next.js app (`npm run dev`).
  3. The login form (in `app/login-signup/LoginSignComp.jsx`) now uses `process.env.NEXT_PUBLIC_API_BASE_URL` and will call e.g. `http://localhost:5000/api/auth/login`.

If you want, I can scaffold a minimal Express auth server in this repo (register/login using MongoDB + JWT) and wire it to these envs — tell me if you'd like that.
