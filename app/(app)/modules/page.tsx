import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries";
import { isAdmin } from "@/lib/permissions";
import { ModuleDot } from "@/components/badges";
import { ModuleFormDialog } from "@/components/module-form-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Modules · Roadmap" };

// Écran 6 — Modules : chaque module avec sa couleur, sa description
// et son nombre de features ; un clic ouvre le backlog filtré.
export default async function ModulesPage() {
  const supabase = await createClient();
  // features(count) : Supabase compte les features de chaque module.
  const [{ data: modules }, viewer] = await Promise.all([
    supabase.from("modules").select("*, features(count)").order("name"),
    getCurrentProfile(),
  ]);
  // Policies « Admins can insert / update modules » : seul un admin crée ou modifie.
  const canManage = isAdmin(viewer);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-title text-h1">Modules</h1>
          <p className="text-ink-soft">Les grandes parties du produit, chacune avec sa couleur.</p>
        </div>
        {canManage && (
          <ModuleFormDialog
            trigger={
              <Button>
                <PlusIcon aria-hidden="true" />
                Nouveau module
              </Button>
            }
          />
        )}
      </div>

      <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {(modules ?? []).map((module) => {
          const count = module.features[0]?.count ?? 0;
          return (
            <li key={module.id} className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-surface p-6 shadow-clay">
              {/* Bandeau à la couleur du module (donnée de la base : style inline autorisé) */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: module.color }} />
              <Link href={`/?module=${module.id}`} className="inline-flex items-center gap-2 self-start hover:text-accent">
                <ModuleDot color={module.color} className="size-3.5" />
                <h2 className="font-title text-h3">{module.name}</h2>
              </Link>
              <p className="text-ink-soft">{module.description || "Pas de description."}</p>
              <div className="mt-auto flex items-baseline gap-2">
                <span className="font-data text-data-xl">{count}</span>
                <span className="text-label uppercase text-ink-soft">feature{count > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/?module=${module.id}`}>
                    Voir les features
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                </Button>
                {canManage && (
                  <ModuleFormDialog
                    module={{
                      id: module.id,
                      values: { name: module.name, color: module.color, description: module.description ?? "" },
                    }}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <PencilIcon aria-hidden="true" />
                        Modifier
                      </Button>
                    }
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
