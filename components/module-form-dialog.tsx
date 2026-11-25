// Composant client : fenêtre de création / modification d'un module,
// avec un nuancier de couleurs, validée par react-hook-form.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveModule } from "@/lib/actions/modules";
import { moduleSchema, type ModuleValues } from "@/lib/schemas";
import { MODULE_COLORS } from "@/lib/constants";
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
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";

type ModuleFormDialogProps = {
  trigger: React.ReactNode;
  // Absent : création. Présent : modification de ce module.
  module?: { id: number; values: ModuleValues };
};

export function ModuleFormDialog({ trigger, module }: ModuleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultValues = module?.values ?? { name: "", color: MODULE_COLORS[0].value, description: "" };

  const form = useForm<ModuleValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  // Couleurs proposées : la palette du design system, plus la couleur actuelle
  // du module si elle n'en fait pas partie (pour ne pas la perdre).
  const colors: { name: string; value: string }[] = [...MODULE_COLORS];
  if (!colors.some((color) => color.value.toLowerCase() === defaultValues.color.toLowerCase())) {
    colors.unshift({ name: "Couleur actuelle", value: defaultValues.color });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(defaultValues);
      setServerError(null);
    }
    setOpen(nextOpen);
  }

  async function onSubmit(values: ModuleValues) {
    const result = await saveModule(module?.id ?? null, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    toast.success(module ? "Module modifié !" : "Module créé !");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? "Modifier le module" : "Nouveau module"}</DialogTitle>
          <DialogDescription>Le nom doit être unique.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="module-name" required>
              Nom
            </Label>
            <Input
              id="module-name"
              placeholder="Ex. : Facturation"
              aria-invalid={errors.name ? true : undefined}
              {...form.register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 inline-flex items-center gap-1.5 text-label uppercase text-ink-soft">
              Couleur
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span className="sr-only">(obligatoire)</span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <label key={color.value} title={color.name} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={color.value}
                    className="peer sr-only"
                    {...form.register("color")}
                  />
                  <span className="sr-only">{color.name}</span>
                  {/* La couleur est une donnée : style inline autorisé (valeur dynamique) */}
                  <span
                    aria-hidden="true"
                    className="bille block size-9 transition duration-150 ease-bounce hover:scale-110 peer-checked:ring-3 peer-checked:ring-accent peer-checked:ring-offset-3 peer-checked:ring-offset-surface peer-focus-visible:shadow-glow"
                    style={{ backgroundColor: color.value }}
                  />
                </label>
              ))}
            </div>
            <FieldError message={errors.color?.message} />
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor="module-description">Description</Label>
            <Textarea id="module-description" placeholder="À quoi sert ce module ?" {...form.register("description")} />
          </div>

          <FieldError message={serverError ?? undefined} />

          <DialogFooter>
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
