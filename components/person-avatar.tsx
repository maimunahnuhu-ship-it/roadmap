import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fullName, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Person = {
  firstname: string | null;
  lastname: string | null;
  email: string;
  avatar_url: string | null;
};

// Photo d'un membre, ou ses initiales si la photo est absente ou ne charge pas.
export function PersonAvatar({ person, className }: { person: Person; className?: string }) {
  return (
    <Avatar className={className} title={fullName(person)}>
      {person.avatar_url && <AvatarImage src={person.avatar_url} alt={fullName(person)} />}
      <AvatarFallback>{initials(person)}</AvatarFallback>
    </Avatar>
  );
}

// Cercle en pointillés pour une feature assignée à personne.
export function NobodyAvatar({ className }: { className?: string }) {
  return (
    <span
      title="Non assignée"
      className={cn("block size-7 shrink-0 rounded-full border-2 border-dashed border-border", className)}
    >
      <span className="sr-only">Non assignée</span>
    </span>
  );
}
