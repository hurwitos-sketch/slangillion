import { spriteAsset } from "@/lib/descent";
import type { CharacterId } from "@/lib/characters";
export default function ActionSprite({
  id,
  frame,
  x,
  y,
  opacity = 1,
  facing = 1,
  onAssetError,
}: {
  id: CharacterId;
  frame: number;
  x: number;
  y: number;
  opacity?: number;
  facing?: number;
  onAssetError: () => void;
}) {
  const size = 180;
  return (
    <g
      opacity={opacity}
      data-sprite-frame={frame}
      transform={
        facing === -1 ? `translate(${x * 2} 0) scale(-1 1)` : undefined
      }
    >
      <ellipse cx={x} cy={y + 4} rx="38" ry="7" fill="#080510" opacity=".35" />
      <svg
        x={x - size / 2}
        y={y - size + 14}
        width={size}
        height={size}
        viewBox={`${(frame % 4) * 192} ${Math.floor(frame / 4) * 192} 192 192`}
        overflow="hidden"
      >
        <image
          href={spriteAsset(id)}
          width="768"
          height="576"
          onError={onAssetError}
        />
      </svg>
    </g>
  );
}
