import Image from "next/image";
import { characterArt, getCharacter, type CharacterId } from "@/lib/characters";
export default function CharacterArt({
  id,
  className = "",
  preload = false,
}: {
  id: CharacterId;
  className?: string;
  preload?: boolean;
}) {
  const c = getCharacter(id);
  return (
    <Image
      key={id}
      src={characterArt(id)}
      alt={`${c.name} character`}
      width={384}
      height={512}
      unoptimized
      preload={preload}
      draggable={false}
      className={`character-art ${className}`}
    />
  );
}
