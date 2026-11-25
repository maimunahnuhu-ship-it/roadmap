// Composant client : il montre un aperçu de l'image choisie et vérifie
// son format et son poids dans le navigateur avant de l'envoyer.
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CameraIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/lib/actions/profile";
import { checkAvatarFile } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/field-error";

export function AvatarForm({ children }: { children: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Libère l'adresse temporaire de l'aperçu quand elle ne sert plus.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Ouvert depuis le menu (/profil#photo) : on place le focus sur le bouton « Choisir une image ».
  useEffect(() => {
    if (window.location.hash === "#photo") inputRef.current?.focus();
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const invalid = checkAvatarFile(file);
    setError(invalid);
    setPreview(invalid ? null : URL.createObjectURL(file));
    if (invalid) event.target.value = "";
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await uploadAvatar(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setPreview(null);
      toast.success("Photo enregistrée !");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <form id="photo" action={handleSubmit} className="flex scroll-mt-28 flex-wrap items-center gap-5">
      {/* Aperçu de la nouvelle image, sinon la photo actuelle (passée par la page) */}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), next/image ne s'applique pas
        <img src={preview} alt="Aperçu de la nouvelle photo" className="size-20 rounded-full border-3 border-surface object-cover shadow-clay-sm" />
      ) : (
        children
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-label uppercase text-ink-soft">Photo de profil</p>
        <div className="flex flex-wrap items-center gap-3">
          {/* Le vrai champ fichier est caché ; ce libellé stylé en bouton l'ouvre */}
          <input
            ref={inputRef}
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            aria-describedby="avatar-hint"
            className="peer sr-only"
          />
          <label
            htmlFor="avatar"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-4 font-bold shadow-clay-sm transition duration-150 ease-bounce hover:-translate-y-px peer-focus-visible:shadow-glow"
          >
            <CameraIcon aria-hidden="true" className="size-4.5" />
            Choisir une image
          </label>
          {preview && (
            <Button type="submit" disabled={isPending}>
              <UploadIcon aria-hidden="true" />
              {isPending ? "Envoi…" : "Enregistrer la photo"}
            </Button>
          )}
        </div>
        <p id="avatar-hint" className="text-small text-ink-soft">
          JPG, PNG ou WebP, 2 Mo maximum.
        </p>
        <FieldError message={error ?? undefined} />
      </div>
    </form>
  );
}
