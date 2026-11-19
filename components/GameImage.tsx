import Image from "next/image";
import { ViceScene } from "./ViceScene";

/**
 * Cadre d'image : affiche le visuel fourni dans `lib/images.ts`,
 * ou l'illustration vectorielle par défaut si l'emplacement est vide.
 */
export function GameImage({
  src,
  alt = "",
  variant = "sunset",
  sizes = "100vw",
  position = "center",
  priority = false,
  className = "",
}: {
  src: string | null;
  alt?: string;
  variant?: "sunset" | "night" | "dawn";
  sizes?: string;
  position?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <ViceScene variant={variant} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
