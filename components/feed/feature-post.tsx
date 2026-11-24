import Link from "next/link";
import { ArrowRightIcon, MessageCircleIcon } from "lucide-react";
import { formatDateTime, fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ModuleDot, PriorityBadge, StatusBadge } from "@/components/badges";
import { CommentForm } from "@/components/comment-form";
import type { CardFeature } from "@/components/feature-card";
import { NobodyAvatar, PersonAvatar } from "@/components/person-avatar";

type Person = NonNullable<CardFeature["assignee"]>;

export type PostFeature = CardFeature & {
  created_at: string;
  comments: { id: number; content: string; created_at: string; author: Person | null }[];
};

// Un « post » du Fil : une feature présentée comme une publication,
// avec ses deux derniers commentaires et un champ pour commenter.
export function FeaturePost({ feature, currentUser }: { feature: PostFeature; currentUser: Person | null }) {
  // Du plus ancien au plus récent ; à date égale, l'ordre d'ajout (id) départage.
  const comments = [...feature.comments].sort(
    (a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id,
  );
  const lastTwo = comments.slice(-2);
  const color = feature.module?.color ?? "#B9A8FF";
  const cancelled = feature.status === "cancelled";

  return (
    <article
      aria-labelledby={`post-${feature.id}`}
      className="relative overflow-hidden rounded-xl bg-surface shadow-clay"
    >
      {/* Bandeau à la couleur du module (donnée de la base : style inline autorisé) */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />

      {/* En haut : la personne assignée et le module */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-4 sm:px-6">
        {feature.assignee ? (
          <PersonAvatar person={feature.assignee} className="size-11 border-3" />
        ) : (
          <NobodyAvatar className="size-11" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">
            {feature.assignee ? feature.assignee.firstname || fullName(feature.assignee) : "Non assignée"}
          </p>
          <Link
            href={`/?vue=fil&module=${feature.module_id}`}
            className="inline-flex items-center gap-1.5 text-small text-ink-soft hover:text-accent"
          >
            <ModuleDot color={color} />
            {feature.module?.name}
          </Link>
        </div>
        <time dateTime={feature.created_at} className="shrink-0 font-data text-small text-ink-muted">
          {formatDateTime(feature.created_at)}
        </time>
      </header>

      {/* Au milieu : la « photo » du post, une carte en relief à la couleur du module */}
      <div className="px-5 sm:px-6">
        <Link
          href={`/features/${feature.id}`}
          className="group relative flex min-h-48 flex-col justify-end gap-4 overflow-hidden rounded-lg bg-surface-tint p-6 shadow-sunken outline-none focus-visible:shadow-glow"
        >
          {/* Grande bille décorative : la couleur vient de la base (style inline autorisé) */}
          <span
            aria-hidden="true"
            className="bille absolute -top-10 -right-10 size-44 opacity-80 transition duration-300 ease-bounce group-hover:scale-110"
            style={{ backgroundColor: color }}
          />
          <span
            aria-hidden="true"
            className="bille absolute top-8 right-36 size-8 opacity-60 transition duration-300 ease-bounce group-hover:-translate-y-1"
            style={{ backgroundColor: color }}
          />
          <h2
            id={`post-${feature.id}`}
            className={cn(
              "relative max-w-11/12 font-title text-h1 group-hover:text-accent max-sm:text-h2",
              cancelled && "text-ink-muted line-through",
            )}
          >
            {feature.title}
          </h2>
          <span className="relative flex flex-wrap gap-2">
            <StatusBadge status={feature.status} />
            <PriorityBadge priority={feature.priority} />
          </span>
        </Link>

        <p className="mt-4 text-body-lg whitespace-pre-line">
          {feature.description || <span className="text-ink-soft">Pas encore de description.</span>}
        </p>
      </div>

      {/* En bas : les commentaires */}
      <footer className="mt-5 flex flex-col gap-4 border-t border-border px-5 pt-4 pb-5 sm:px-6">
        <p className="inline-flex items-center gap-2 font-bold">
          <MessageCircleIcon aria-hidden="true" className="size-5 text-accent" />
          <span className="font-data text-data">{comments.length}</span>
          commentaire{comments.length > 1 ? "s" : ""}
        </p>

        {lastTwo.length > 0 && (
          <ol className="flex flex-col gap-3">
            {lastTwo.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                {comment.author && <PersonAvatar person={comment.author} className="size-8" />}
                <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm bg-surface-tint px-4 py-2">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <strong className="font-bold">{comment.author ? fullName(comment.author) : "Membre"}</strong>
                    <time dateTime={comment.created_at} className="font-data text-small text-ink-soft">
                      {formatDateTime(comment.created_at)}
                    </time>
                  </p>
                  <p className="line-clamp-3 whitespace-pre-line">{comment.content}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {comments.length > 0 && (
          <Link
            href={`/features/${feature.id}`}
            className="inline-flex items-center gap-1 self-start text-small text-accent hover:underline"
          >
            Voir les {comments.length} commentaire{comments.length > 1 ? "s" : ""}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        )}

        <div className="flex items-start gap-3">
          {currentUser && <PersonAvatar person={currentUser} className="size-10" />}
          <CommentForm featureId={feature.id} compact />
        </div>
      </footer>
    </article>
  );
}
