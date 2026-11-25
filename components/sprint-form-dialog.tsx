// Composant client : fenêtre de création / modification d'un sprint,
// validée par react-hook-form avant d'appeler la Server Action.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSprint, updateSprint } from "@/lib/actions/sprints";
import { sprintSchema, type SprintValues } from "@/lib/schemas";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";

type SprintFormDialogProps = {
  trigger: React.ReactNode;
  // Absent : création. Présent : modification de ce sprint.
  sprint?: { id: number; name: string; values: SprintValues };
};

export function SprintFormDialog({ trigger, sprint }: SprintFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultValues = sprint?.values ?? { start_date: "", end_date: "", goal: "" };

  const form = useForm<SprintValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(defaultValues);
      setServerError(null);
    }
    setOpen(nextOpen);
  }

  async function onSubmit(values: SprintValues) {
    const result = sprint ? await updateSprint(sprint.id, values) : await createSprint(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    toast.success(sprint ? "Sprint modifié !" : "Sprint créé !");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sprint ? `Modifier le ${sprint.name.toLowerCase()}` : "Créer un sprint"}</DialogTitle>
          <DialogDescription>
            {sprint ? "Dates et objectif du sprint." : "Il sera créé au statut « Planifié »."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sprint-start" required>
              Date de début
            </Label>
            <Input
              id="sprint-start"
              type="date"
              className="font-data text-data"
              aria-invalid={errors.start_date ? true : undefined}
              {...form.register("start_date")}
            />
            <FieldError message={errors.start_date?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sprint-end" required>
              Date de fin
            </Label>
            <Input
              id="sprint-end"
              type="date"
              className="font-data text-data"
              aria-invalid={errors.end_date ? true : undefined}
              {...form.register("end_date")}
            />
            <FieldError message={errors.end_date?.message} />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="sprint-goal">Objectif</Label>
            <Input
              id="sprint-goal"
              placeholder="Ex. : Ouvrir la gestion des rôles aux administrateurs"
              {...form.register("goal")}
            />
            <p className="text-small text-ink-soft">En une phrase.</p>
          </div>

          <div className="sm:col-span-2">
            <FieldError message={serverError ?? undefined} />
          </div>

          <DialogFooter className="sm:col-span-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : sprint ? "Enregistrer" : "Créer le sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
