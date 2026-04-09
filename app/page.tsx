import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams.error || resolvedParams.error_description;

  if (error) {
    const desc = resolvedParams.error_description || resolvedParams.error;
    redirect(`/auth/auth-code-error?error_description=${encodeURIComponent(String(desc))}`);
  }

  redirect("/pokedex");
  
  // Return null to satisfy TypeScript's JSX requirements, 
  // though redirect() will prevent this from ever rendering.
  return null;
}
