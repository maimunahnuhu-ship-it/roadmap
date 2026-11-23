// Composant client : il envoie son formulaire dès qu'on choisit une option,
// pour éviter un bouton « Valider » à côté de chaque liste.
"use client";

import * as React from "react";
import { NativeSelect } from "@/components/ui/native-select";

export function AutoSubmitSelect(props: React.ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect
      {...props}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    />
  );
}
