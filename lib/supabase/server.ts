import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieOptions = { [key: string]: any };

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local.",
    );
  }

  const cookieStore = await cookies();

  const getCookie = (name: string) => {
    if (cookieStore && typeof (cookieStore as any).get === "function") {
      return (cookieStore as any).get(name)?.value;
    }
    if (cookieStore && typeof (cookieStore as any).getAll === "function") {
      const all = (cookieStore as any).getAll();
      const match = Array.isArray(all)
        ? all.find((cookie: { name: string }) => cookie.name === name)
        : undefined;
      return match?.value;
    }
    return undefined;
  };

  const setCookie = (name: string, value: string, options: CookieOptions) => {
    if (cookieStore && typeof (cookieStore as any).set === "function") {
      (cookieStore as any).set({ name, value, ...options });
    }
  };

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return getCookie(name);
      },
      set(name: string, value: string, options: CookieOptions) {
        setCookie(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        setCookie(name, "", { ...options, maxAge: 0 });
      },
    },
  });
}
