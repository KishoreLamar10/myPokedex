import { redirect } from "next/navigation";

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = typeof searchParams === 'function' ? {} : (searchParams as any);

  return <HomeContent searchParams={searchParams} />;
}

async function HomeContent({ searchParams }: { searchParams: any }) {
  const resolvedParams = await searchParams;
  const error = resolvedParams.error || resolvedParams.error_description;

  if (error) {
    const desc = resolvedParams.error_description || resolvedParams.error;
    redirect(`/auth/auth-code-error?error_description=${encodeURIComponent(String(desc))}`);
  }

  redirect("/pokedex");
}
