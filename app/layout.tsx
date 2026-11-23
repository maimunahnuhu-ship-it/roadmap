import type { Metadata } from "next";
import { Fredoka, Nunito, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Les trois polices du design system. Chacune crée une variable CSS
// que globals.css relie aux classes font-title, font-text et font-data.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Capturer, ranger, prioriser et planifier les features du produit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fredoka.variable} ${nunito.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
