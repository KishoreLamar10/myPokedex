/**
 * Detects the correct site URL regardless of whether the app is running
 * in development, on a Vercel preview branch, or in production.
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your custom domain in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview/production
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  
  return url;
};
