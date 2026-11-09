import { WORLD_ASSETS, type descentAt } from "@/lib/descent";
import type { Tier } from "@/lib/tiers";
import type { CharacterId } from "@/lib/characters";
import ActionSprite from "./ActionSprite";
import Portal from "./Portal";
type Scene = ReturnType<typeof descentAt>;
export default function World({
  scene,
  tier,
  character,
  onAssetError,
}: {
  scene: Scene;
  tier: Tier;
  character: CharacterId;
  onAssetError: () => void;
}) {
  const { point, action, progress, elapsed } = scene;
  const digging = action === "digging";
  const cracking = action === "breaking";
  const dust = digging || cracking || action === "landing";
  return (
    <svg viewBox="0 0 800 500" className="descent-world" aria-hidden="true">
      <defs>
        <linearGradient id="descent-soil" x2="0" y2="1">
          <stop stopColor="#47373a" />
          <stop offset="1" stopColor="#19131e" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#120d1a" />
      <g
        transform={`translate(0 ${-scene.cameraY})`}
        data-camera-y={scene.cameraY.toFixed(1)}
      >
        {WORLD_ASSETS.slice(0, tier + 1).map((src, i) => (
          <g key={src} data-world-layer={i}>
            <image
              href={src}
              y={i * 500}
              width="800"
              height="500"
              preserveAspectRatio="xMidYMid slice"
              onError={onAssetError}
            />
            {i > 0 && i < 4 && (
              <path
                d={`M0 ${i * 500 + 456}l40 -8 45 13 42 -8 39 6 55 -12 61 13 41 -9 53 12 58 -12 45 13 55 -12 47 10 61 -7 103 5V${i * 500 + 500}H0Z`}
                fill="url(#descent-soil)"
              />
            )}
          </g>
        ))}
        {/* The same stair path continues across the city/subway boundary. */}
        {tier >= 3 && <Portal x={640} y={1910} active={tier === 4} />}
        {tier === 4 && <Portal x={170} y={2410} active />}
        {cracking && (
          <path
            d={`M${point.x - 40} ${point.y + 2}l26 -6 15 9 11 -13 16 9 23 -5`}
            stroke="#edc39b"
            fill="none"
            strokeWidth="4"
          />
        )}
        {(digging || cracking || action === "falling") && (
          <ellipse
            cx={action === "falling" ? scene.point.x : point.x + 25}
            cy={
              action === "falling"
                ? Math.floor((point.y - 410) / 500) * 500 + 410
                : point.y + 5
            }
            rx={cracking ? 35 : 23}
            ry="7"
            fill="#0b0810"
            opacity=".85"
          />
        )}
        {scene.level >= 2.6 &&
          scene.level <= 3.2 &&
          Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d={`M${70 + i * 94} ${1620 + (i % 3) * 70}l4 8 7 3 -7 3 -4 8 -3 -8 -8 -3 8 -3Z`}
              fill={i % 2 ? "#8de7f1" : "#f8c16c"}
              opacity={0.4 + Math.sin(elapsed / 280 + i) * 0.25}
            />
          ))}
        <ActionSprite
          id={character}
          frame={scene.frame}
          x={point.x}
          y={point.y}
          opacity={scene.opacity}
          facing={scene.facing}
          onAssetError={onAssetError}
        />
        {dust && (
          <g data-effect="dirt">
            {Array.from({ length: 14 }, (_, i) => {
              const t = ((elapsed % 240) / 240 + i / 14) % 1;
              const spread = (i % 2 ? 1 : -1) * (18 + t * (35 + i * 3));
              return (
                <path
                  key={i}
                  d="M-3 -3L4 -2 3 4 -4 2Z"
                  transform={`translate(${point.x + 20 + spread} ${point.y - 8 - Math.sin(t * Math.PI) * (25 + i * 3)}) rotate(${i * 38 + t * 120})`}
                  fill={i % 2 ? "#ac8970" : "#706068"}
                  opacity={1 - t}
                />
              );
            })}
          </g>
        )}
        {action === "landing" && (
          <ellipse
            cx={point.x}
            cy={point.y + 5}
            rx={25 + progress * 50}
            ry={6 + progress * 10}
            fill="#bd9e89"
            opacity={(1 - progress) * 0.6}
          />
        )}
      </g>
      {scene.portalFlash > 0 && (
        <rect
          width="800"
          height="500"
          fill="#be87ee"
          opacity={scene.portalFlash * 0.75}
        />
      )}
    </svg>
  );
}
