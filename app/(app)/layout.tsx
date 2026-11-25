import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries";
import { logout } from "@/lib/actions/auth";
import { fullName } from "@/lib/format";
import { NavLinks } from "@/components/nav-links";
import { PersonAvatar } from "@/components/person-avatar";
import { Button } from "@/components/ui/button";

// Mise en page commune à toutes les pages réservées aux membres :
// le menu en haut, puis le contenu de la page.
// Le dossier (app) est un « groupe de routes » : il n'apparaît pas dans l'adresse.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await getCurrentProfile();
  // Double sécurité : proxy.ts redirige déjà les visiteurs non connectés.
  if (!profile) redirect("/login");

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-19 max-w-page items-center gap-6 overflow-x-auto px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-title text-h3 font-semibold">
            <span aria-hidden="true" className="bille size-7.5 bg-aurora" />
            <span className="max-sm:sr-only">Roadmap</span>
          </Link>

          <NavLinks />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {/* Un clic sur ma photo ouvre la page « Mon profil » */}
            <Link
              href="/profil"
              aria-label="Mon profil"
              className="flex items-center gap-3 rounded-full pr-1 outline-none transition hover:text-accent focus-visible:shadow-glow"
            >
              <PersonAvatar person={profile} />
              <span className="text-small max-md:hidden">{fullName(profile)}</span>
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOutIcon aria-hidden="true" />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-page flex-1 flex-col px-8 pt-10 pb-28">
        {children}
      </main>
    </>
  );
}
