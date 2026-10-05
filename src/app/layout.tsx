import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SemPDF", template: "%s | SemPDF" },
  description: "Search a library of PDFs by meaning, not just keywords, with a local embedding model.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get("theme")?.value;
  return (
    <html lang="en" data-theme={theme === "dark" || theme === "light" ? theme : undefined}>
      <body>{children}</body>
    </html>
  );
}
