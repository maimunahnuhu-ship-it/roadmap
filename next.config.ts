import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Une Server Action accepte 1 Mo par défaut : on monte à 3 Mo pour
      // les photos de profil (2 Mo maximum + l'enveloppe du formulaire).
      bodySizeLimit: "3mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
