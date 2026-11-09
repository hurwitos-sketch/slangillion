import { useId } from "react";
export default function Portal({
  x,
  y,
  active,
}: {
  x: number;
  y: number;
  active: boolean;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <g
      transform={`translate(${x} ${y})`}
      className={active ? "magic-portal active" : "magic-portal"}
    >
      <defs>
        <radialGradient id={id}>
          <stop stopColor="#e0c4ff" />
          <stop offset=".45" stopColor="#4fdcf2" />
          <stop offset=".75" stopColor="#a252ed" />
          <stop offset="1" stopColor="#34124e" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="-80" rx="58" ry="91" fill="#ca66ff" opacity=".13" />
      <path
        d="M-48 0V-98Q-40 -165 0 -166Q40 -165 48 -98V0"
        stroke="#453148"
        strokeWidth="19"
        fill="none"
      />
      <ellipse
        cx="0"
        cy="-78"
        rx="39"
        ry="77"
        fill={`url(#${id})`}
        stroke="#e4a4ff"
        strokeWidth="3"
      />
      <g className="portal-swirl">
        <path
          d="M-28 -105Q30 -150 28 -78Q-20 -25 -24 -78Q0 -125 20 -80Q-10 -45 -15 -77"
          stroke="#dbb2ff"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M-26 -80Q-5 -135 27 -100M-27 -60Q8 -20 29 -80"
          stroke="#64e7f2"
          strokeWidth="3"
          fill="none"
        />
      </g>
      {[-1, 1].map((sign) => (
        <g key={sign}>
          <path
            d={`M${sign * 48} -106l6 7 -6 7 -6 -7Z`}
            stroke="#efc274"
            fill="none"
            strokeWidth="2"
          />
          <path
            d={`M${sign * 43} -48l5 -5 5 5 -5 5Z`}
            stroke="#efc274"
            fill="none"
            strokeWidth="2"
          />
        </g>
      ))}
      <path d="M-16 -170l8 7 8 -13 8 13 8 -7 -4 16H-12Z" fill="#f0c472" />
      <ellipse cy="-2" rx="47" ry="7" fill="#ba6bff" opacity=".4" />
    </g>
  );
}
