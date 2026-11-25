// Composant client : la fenêtre s'ouvre dans le navigateur et react-hook-form
// valide le formulaire avant d'appeler la Server Action.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFeature, updateFeature } from "@/lib/actions/features";
import { featureSchema, type FeatureValues } from "@/lib/schemas";
import {
  EFFORTS,
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  IMPACTS,
  IMPACT_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  SPRINT_STATUS_LABELS,
  toSprintStatus,
} from "@/lib/constants";
import { fullName, sprintName } from "@/lib/format";
import type { FormOptions } from "@/lib/queries";
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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";

// Valeurs d'un formulaire vide : les mêmes valeurs par défaut que la base.
const EMPTY_FEATURE: FeatureValues = {
  title: "",
  module_id: "",
  description: "",
  status: "backlog",
  priority: "medium",
  impact: "medium",
  effort: "",
  sprint_id: "",
  assigned_to: "",
};

type FeatureFormDialogProps = {
  options: FormOptions;
  // Bouton qui ouvre la fenêtre (passé par la page)
  trigger: React.ReactNode;
  // Absent : création. Présent : modification de cette feature.
  feature?: { id: number; values: FeatureValues };
};

export function FeatureFormDialog({ options, trigger, feature }: FeatureFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultValues = feature?.values ?? EMPTY_FEATURE;

  const form = useForm<FeatureValues>({
    resolver: zodResolver(featureSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  // À chaque ouverture, on repart des valeurs actuelles de la feature.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(defaultValues);
      setServerError(null);
    }
    setOpen(nextOpen);
  }

  async function onSubmit(values: FeatureValues) {
    const result = feature ? await updateFeature(feature.id, values) : await createFeature(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    toast.success(feature ? "Feature modifiée !" : "Feature créée !");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feature ? "Modifier la feature" : "Nouvelle feature"}</DialogTitle>
          <DialogDescription>Seuls le titre et le module sont obligatoires.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2" noValidate>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="feature-title" required>
              Titre
            </Label>
            <Input
              id="feature-title"
              placeholder="Ex. : Export des devis en PDF"
              aria-invalid={errors.title ? true : undefined}
              {...form.register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-module" required>
              Module
            </Label>
            <NativeSelect
              id="feature-module"
              aria-invalid={errors.module_id ? true : undefined}
              {...form.register("module_id")}
            >
              <option value="">Choisir un module</option>
              {options.modules.map((module) => (
                <option key={module.id} value={String(module.id)}>
                  {module.name}
                </option>
              ))}
            </NativeSelect>
            <FieldError message={errors.module_id?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-status">Statut</Label>
            <NativeSelect id="feature-status" {...form.register("status")}>
              {FEATURE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {FEATURE_STATUS_LABELS[status]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-priority">Priorité</Label>
            <NativeSelect id="feature-priority" {...form.register("priority")}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-impact">Impact</Label>
            <NativeSelect id="feature-impact" {...form.register("impact")}>
              {IMPACTS.map((impact) => (
                <option key={impact} value={impact}>
                  {IMPACT_LABELS[impact]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-effort">Effort</Label>
            <NativeSelect id="feature-effort" {...form.register("effort")}>
              <option value="">Non estimé</option>
              {EFFORTS.map((effort) => (
                <option key={effort} value={effort}>
                  {effort.toUpperCase()}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="feature-sprint">Sprint</Label>
            <NativeSelect id="feature-sprint" {...form.register("sprint_id")}>
              <option value="">Sans sprint (backlog)</option>
              {options.sprints.map((sprint) => (
                <option key={sprint.id} value={String(sprint.id)}>
                  {sprintName(sprint.id)} · {SPRINT_STATUS_LABELS[toSprintStatus(sprint.status)].toLowerCase()}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="feature-assignee">Assignée à</Label>
            <NativeSelect id="feature-assignee" {...form.register("assigned_to")}>
              <option value="">Personne</option>
              {options.profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {fullName(profile)}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea
              id="feature-description"
              placeholder="Le besoin, le contexte, ce qui serait réussi…"
              {...form.register("description")}
            />
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
              {isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
