// Composant client : le texte d'un commentaire se transforme en champ
// quand son auteur clique sur « Modifier ».
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { updateComment } from "@/lib/actions/features";
import { commentSchema, type CommentValues } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/field-error";

type CommentBodyProps = {
  commentId: number;
  content: string;
  // true seulement pour l'auteur du commentaire (calculé côté serveur)
  editable: boolean;
  clamp?: boolean; // dans le Fil : texte coupé à 3 lignes
};

export function CommentBody({ commentId, content, editable, clamp = false }: CommentBodyProps) {
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content },
  });
  const { errors, isSubmitting } = form.formState;

  function startEditing() {
    form.reset({ content });
    setServerError(null);
    setEditing(true);
  }

  async function onSubmit(values: CommentValues) {
    const result = await updateComment(commentId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-2">
        <p className={cn("min-w-0 flex-1 whitespace-pre-line", clamp && "line-clamp-3")}>{content}</p>
        {editable && (
          <Button variant="ghost" size="sm" onClick={startEditing} aria-label="Modifier mon commentaire">
            <PencilIcon aria-hidden="true" />
            <span className="max-sm:sr-only">Modifier</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
      <label htmlFor={`edit-comment-${commentId}`} className="sr-only">
        Modifier le commentaire
      </label>
      <Textarea
        id={`edit-comment-${commentId}`}
        autoFocus
        className="min-h-20 bg-surface"
        aria-invalid={errors.content ? true : undefined}
        {...form.register("content")}
      />
      <FieldError message={errors.content?.message ?? serverError ?? undefined} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
