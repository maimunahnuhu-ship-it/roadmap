// Composant client : react-hook-form valide le commentaire et vide le champ
// après l'envoi, sans recharger la page.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendIcon } from "lucide-react";
import { addComment } from "@/lib/actions/features";
import { commentSchema, type CommentValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";

export function CommentForm({ featureId }: { featureId: number }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: CommentValues) {
    setServerError(null);
    const result = await addComment(featureId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col items-end gap-3" noValidate>
      <label htmlFor="comment" className="sr-only">
        Écrire un commentaire
      </label>
      <Textarea
        id="comment"
        placeholder="Écrire un commentaire…"
        className="min-h-24"
        aria-invalid={errors.content ? true : undefined}
        {...form.register("content")}
      />
      <div className="flex w-full items-center justify-between gap-3">
        <FieldError message={errors.content?.message ?? serverError ?? undefined} />
        <Button type="submit" className="ml-auto" disabled={isSubmitting}>
          <SendIcon aria-hidden="true" />
          {isSubmitting ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
    </form>
  );
}
