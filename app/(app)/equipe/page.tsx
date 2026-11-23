import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/format";
import { PersonAvatar } from "@/components/person-avatar";

export const metadata: Metadata = { title: "Équipe · Roadmap" };

// Écran 7 — Équipe : les membres et leur nombre de features assignées ;
// un clic ouvre le backlog filtré sur la personne.
export default async function TeamPage() {
  const supabase = await createClient();
  // features(count) : Supabase compte les features assignées à chaque membre.
  const { data: members } = await supabase.from("profiles").select("*, features(count)").order("firstname");

  return (
    <>
      <div className="mb-10">
        <h1 className="font-title text-h1">Équipe</h1>
        <p className="text-ink-soft">
          {members?.length ?? 0} membres · clique sur une personne pour voir ses features.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(members ?? []).map((member) => {
          const count = member.features[0]?.count ?? 0;
          return (
            <li key={member.id}>
              <Link
                href={`/?assignee=${member.id}`}
                className="flex h-full flex-col items-center gap-4 rounded-xl bg-surface p-6 text-center shadow-clay transition duration-150 ease-bounce outline-none hover:-translate-y-0.5 hover:shadow-clay-hover focus-visible:shadow-glow"
              >
                <PersonAvatar person={member} className="size-18 border-3" />
                <div className="min-w-0">
                  <h2 className="font-title text-h3">{fullName(member)}</h2>
                  <p className="truncate text-small text-ink-soft">{member.email}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-data text-data-xl">{count}</span>
                  <span className="text-label uppercase text-ink-soft">assignée{count > 1 ? "s" : ""}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
