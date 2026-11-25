// Composant client : react-hook-form valide le prénom et le nom
// et affiche la confirmation ou le refus de la base.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { updateMyProfile } from "@/lib/actions/profile";
import { profileSchema, type ProfileValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileValues }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: ProfileValues) {
    setServerError(null);
    setSaved(false);
    const result = await updateMyProfile(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstname" required>
            Prénom
          </Label>
          <Input id="firstname" autoComplete="given-name" aria-invalid={errors.firstname ? true : undefined} {...form.register("firstname")} />
          <FieldError message={errors.firstname?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastname" required>
            Nom
          </Label>
          <Input id="lastname" autoComplete="family-name" aria-invalid={errors.lastname ? true : undefined} {...form.register("lastname")} />
          <FieldError message={errors.lastname?.message} />
        </div>
      </div>

      <FieldError message={serverError ?? undefined} />

      <div className="flex items-center justify-end gap-4">
        {saved && (
          <p role="status" className="inline-flex items-center gap-1.5 text-small text-status-done">
            <CheckIcon aria-hidden="true" className="size-4" />
            Profil enregistré
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
