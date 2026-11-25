import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries";
import { fullName } from "@/lib/format";
import { PersonAvatar } from "@/components/person-avatar";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = { title: "Mon profil · Roadmap" };

// Page « Mon profil » : on modifie son prénom et son nom.
// Le rôle est seulement affiché, jamais modifiable ici.
export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <>
      <h1 className="mb-10 font-title text-h1">Mon profil</h1>

      <section className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 overflow-hidden rounded-xl bg-surface p-8 shadow-clay max-sm:p-5">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-aurora" />

        <div className="flex flex-wrap items-center gap-5">
          <PersonAvatar person={profile} className="size-20 border-3" />
          <div className="min-w-0">
            <p className="font-title text-h2">{fullName(profile)}</p>
            <p className="truncate text-ink-soft">{profile.email}</p>
            {/* Rôle en lecture seule : un simple texte, en dehors du formulaire */}
            <p className="mt-1 text-small">
              Rôle : <span className="font-bold">{profile.role === "admin" ? "Administrateur" : "Membre"}</span>
            </p>
          </div>
        </div>

        <ProfileForm defaultValues={{ firstname: profile.firstname ?? "", lastname: profile.lastname ?? "" }} />
      </section>
    </>
  );
}
