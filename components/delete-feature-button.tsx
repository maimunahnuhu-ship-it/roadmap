// Composant client : la fenêtre de confirmation s'ouvre dans le navigateur
// et affiche le refus éventuel de la base.
"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { deleteFeature } from "@/lib/actions/features";
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
import { FieldError } from "@/components/field-error";

export function DeleteFeatureButton({
  featureId,
  title,
  commentCount,
}: {
  featureId: number;
  title: string;
  commentCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      // Si tout va bien, l'action redirige vers le Backlog ;
      // sinon elle renvoie le message de refus.
      const result = await deleteFeature(featureId);
      if (result.error) setError(result.error);
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setError(null);
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-danger hover:bg-danger-soft hover:text-danger">
          <Trash2Icon aria-hidden="true" />
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette feature ?</DialogTitle>
          <DialogDescription>
            « {title} »
            {commentCount > 0 &&
              ` et ses ${commentCount} commentaire${commentCount > 1 ? "s" : ""}`}{" "}
            seront supprimés définitivement.
          </DialogDescription>
        </DialogHeader>
        <FieldError message={error ?? undefined} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
            <Trash2Icon aria-hidden="true" />
            {isPending ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
