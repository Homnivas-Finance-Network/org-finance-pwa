/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: this app is a client-driven PWA that talks to the
  // Cloud Run backend at runtime. No Next.js API routes or SSR are used,
  // so `next build` produces a plain static site in /out that Cloudflare
  // Pages serves directly — same deploy pattern as your other projects.
  output: "export",
  images: { unoptimized: true }, // static export can't use the Next.js image optimizer
};

export default nextConfig;
