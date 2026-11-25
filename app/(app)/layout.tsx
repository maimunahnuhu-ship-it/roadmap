import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries";
import { logout } from "@/lib/actions/auth";
import { fullName } from "@/lib/format";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { PersonAvatar } from "@/components/person-avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Confetti } from "@/components/confetti";

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
        {/* Pleine largeur ; les marges s'agrandissent avec l'écran (téléphone → ordinateur) */}
        <div className="flex h-19 w-full items-center gap-3 overflow-x-auto px-4 sm:gap-6 sm:px-6 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-3 font-title text-h3 font-semibold">
            <Logo className="size-9 transition duration-150 ease-bounce hover:-rotate-6" />
            <span className="max-sm:sr-only">Roadmap</span>
          </Link>

          <NavLinks />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {/* Un clic sur ma photo ouvre « Mon profil », directement au champ photo */}
            <Link
              href="/profil#photo"
              aria-label="Mon profil"
              className="flex items-center gap-3 rounded-full pr-1 outline-none transition hover:text-accent focus-visible:shadow-glow"
            >
              <PersonAvatar person={profile} />
              <span className="text-small max-md:hidden">{fullName(profile)}</span>
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOutIcon aria-hidden="true" />
                {/* Sur téléphone, seule l'icône reste visible (le texte reste lu par les lecteurs d'écran) */}
                <span className="max-sm:sr-only">Déconnexion</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col px-4 pt-8 pb-28 sm:px-6 lg:px-10 lg:pt-10">
        {children}
      </main>

      {/* Notifications animées en bas de l'écran, et pluie de confettis */}
      <Toaster />
      <Confetti />
    </>
  );
}
