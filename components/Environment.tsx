import type { Tier } from "@/lib/data";
export default function Environment({
  tier = 4,
  hero = false,
}: {
  tier?: Tier;
  hero?: boolean;
}) {
  return (
    <div
      className={`environment env-${tier} ${hero ? "hero-art" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 640 330" role="presentation">
        <defs>
          <linearGradient id={`sky-${tier}`} x2="0" y2="1">
            <stop stopColor="#17101f" />
            <stop offset="1" stopColor="#08090e" />
          </linearGradient>
          <radialGradient id={`glow-${tier}`}>
            <stop stopColor="currentColor" stopOpacity=".3" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="640" height="330" fill={`url(#sky-${tier})`} />
        <ellipse
          cx="320"
          cy="190"
          rx="260"
          ry="160"
          fill={`url(#glow-${tier})`}
        />
        {tier === 1 ? (
          <>
            <path
              d="M40 280V120Q320 -55 600 120V280M100 280V145Q320 5 540 145V280"
              stroke="#363044"
              strokeWidth="20"
              fill="none"
            />
            <rect
              x="110"
              y="150"
              width="420"
              height="105"
              rx="18"
              fill="#252835"
              stroke="currentColor"
            />
            {[140, 220, 300, 380, 460].map((x) => (
              <rect
                key={x}
                x={x}
                y="170"
                width="50"
                height="40"
                rx="4"
                fill="#0a1721"
                stroke="currentColor"
              />
            ))}
            <path d="M0 285H640M0 300H640" stroke="currentColor" opacity=".5" />
          </>
        ) : tier === 2 || tier === 3 ? (
          <>
            <path
              d="M0 0H640V330L565 210 530 270 480 115 420 70 360 120 310 40 250 140 180 100 110 230 50 190 0 330Z"
              fill="#272031"
            />
            <path
              d="M0 330L90 265 165 300 230 245 320 285 410 230 500 290 565 250 640 330"
              fill="#302434"
              stroke="currentColor"
              strokeOpacity=".4"
            />
            {tier === 3 &&
              [140, 310, 450].map((x, i) => (
                <path
                  key={x}
                  d={`M${x} 270l15 -${55 + i * 16} 15 ${55 + i * 16}Z`}
                  fill="currentColor"
                  opacity=".6"
                />
              ))}
          </>
        ) : (
          <>
            <path
              d="M45 280V55L155 10H485L595 55V280"
              stroke="#302336"
              strokeWidth="22"
              fill="none"
            />
            <path
              d="M105 275V90L180 45H460L535 90V275"
              stroke="currentColor"
              strokeOpacity=".25"
              strokeWidth="2"
              fill="none"
            />
            <path d="M135 260V115H505V260" fill="#100c15" stroke="#5f2b64" />
            <path
              d="M155 130H485M155 240H485"
              stroke="currentColor"
              strokeWidth="3"
            />
            <text
              x="320"
              y="185"
              textAnchor="middle"
              fill="currentColor"
              fontSize="25"
              fontWeight="900"
              letterSpacing="6"
            >
              THE UNDERGROUND
            </text>
            <text
              x="320"
              y="210"
              textAnchor="middle"
              fill="#c8a3d0"
              fontSize="9"
              letterSpacing="5"
            >
              IF YOU KNOW, YOU KNOW
            </text>
            {[172, 208, 432, 468].map((x) => (
              <g key={x}>
                <rect x={x} y="218" width="25" height="45" fill="#29202f" />
                <circle
                  cx={x + 12}
                  cy="242"
                  r="8"
                  stroke="currentColor"
                  fill="#0b0b12"
                />
              </g>
            ))}
            <path
              d="M180 50L245 270M460 50L395 270"
              stroke="#b481ff"
              strokeWidth="20"
              opacity=".07"
            />
          </>
        )}
        <path
          d="M0 285L640 285M60 330L220 285M580 330L420 285M240 330L280 285M400 330L360 285"
          stroke="currentColor"
          strokeOpacity=".2"
        />
        <path d="M20 315H620" stroke="currentColor" strokeOpacity=".15" />
      </svg>
      <span className="art-coordinate">
        DEPTH {String([0, 200, 600, 1000][tier - 1]).padStart(4, "0")}M ↓
      </span>
    </div>
  );
}
