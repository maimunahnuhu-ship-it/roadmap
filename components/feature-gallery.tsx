import Link from "next/link";
import { cn } from "@/lib/utils";
import { featureCardClasses, FeatureCardContent, type CardFeature } from "@/components/feature-card";

// Vue Galerie : les features en cartes, sur une grille.
export function FeatureGallery({ features }: { features: CardFeature[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {features.map((feature) => (
        <li key={feature.id} className="flex">
          <Link href={`/features/${feature.id}`} className={cn(featureCardClasses, "w-full")}>
            <FeatureCardContent feature={feature} showDescription />
          </Link>
        </li>
      ))}
    </ul>
  );
}
