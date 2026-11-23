import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Le proxy (anciennement « middleware ») s'exécute avant chaque page :
// c'est ici qu'on réserve l'application aux membres connectés.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Tout sauf les fichiers techniques de Next.js et les images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
