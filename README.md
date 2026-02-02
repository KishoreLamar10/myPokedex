This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

Open the app in your browser:

- **http://localhost:3000** or **http://127.0.0.1:3000**

If localhost doesn’t work (e.g. on some Windows setups), try **http://127.0.0.1:3000**. The dev server is started with `--hostname 0.0.0.0`, so you can also use your machine’s IP (e.g. **http://192.168.1.x:3000**) from another device on your network.

Visiting the root URL (**/**) redirects directly to the Pokédex (**/pokedex**).

## Supabase (caught data)

Caught Pokémon are stored in Supabase so your progress persists across devices.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
3. In the Supabase **SQL Editor**, run the script in `supabase/schema.sql` to create the `caught` table and RLS policies.
4. In **Authentication → Providers**, enable **Anonymous** sign-in so users can use the app without an account.

## CI/CD (GitHub Actions)

A workflow runs on every push and pull request to `main` (or `master`):

- **Lint** — `npm run lint`
- **Build** — `npm run build`

To make the build pass, add your Supabase env vars as **repository secrets** (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If you don’t add them, the build may still succeed locally but can fail in CI when Next.js inlines these values.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. Push this repo to GitHub (if you haven’t already).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** your repository.
3. Vercel will detect Next.js and use the default build settings. Click **Deploy**.
4. After the first deploy, go to your project on Vercel → **Settings** → **Environment Variables**. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key  
     Use the same values as in `.env.local`. Apply to **Production**, **Preview**, and **Development** if you want them in all environments.
5. **Redeploy** (Deployments → ⋮ on latest → Redeploy) so the new env vars are used.

After that, every push to `main` (or your production branch) will trigger a new deployment. Preview deployments are created for pull requests.
