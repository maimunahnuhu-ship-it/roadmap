// Composant client : fenêtre qui liste les features du backlog à cocher ;
// elle se ferme une fois la Server Action terminée.
"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { addFeaturesToSprint } from "@/lib/actions/sprints";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModuleDot, PriorityBadge } from "@/components/badges";

type BacklogFeature = {
  id: number;
  title: string;
  priority: string;
  module: { color: string } | null;
};

export function AddFeaturesDialog({
  sprintId,
  sprintLabel,
  backlog,
}: {
  sprintId: number;
  sprintLabel: string;
  backlog: BacklogFeature[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addFeaturesToSprint(sprintId, formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon aria-hidden="true" />
          Ajouter depuis le backlog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter au {sprintLabel.toLowerCase()}</DialogTitle>
          <DialogDescription>Features du backlog, sans sprint.</DialogDescription>
        </DialogHeader>

        {backlog.length === 0 ? (
          <p className="text-ink-soft">Toutes les features sont déjà dans un sprint.</p>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Features à ajouter</legend>
              {backlog.map((feature) => (
                <label
                  key={feature.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface-tint px-4 py-3 transition hover:bg-accent-soft"
                >
                  <input type="checkbox" name="feature_ids" value={feature.id} className="size-4.5 accent-accent" />
                  <ModuleDot color={feature.module?.color ?? "#B9A8FF"} />
                  <span className="min-w-0 flex-1 truncate font-bold">{feature.title}</span>
                  <PriorityBadge priority={feature.priority} compact />
                </label>
              ))}
            </fieldset>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Ajout…" : "Ajouter au sprint"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
