import type { CSSProperties } from "react";

export type DecorationKind =
  | "tape"
  | "stamp"
  | "ticket"
  | "receipt"
  | "doodle"
  | "flower"
  | "film"
  | "map"
  | "heart";

type DecorationProps = {
  kind: DecorationKind;
  className?: string;
  label?: string;
  style?: CSSProperties;
};

const defaultLabels: Record<DecorationKind, string> = {
  tape: "",
  stamp: "Melbourne\nVIC",
  ticket: "Tram ticket",
  receipt: "Melbourne memory",
  doodle: "always us ↗",
  flower: "",
  film: "",
  map: "",
  heart: "♥",
};

export function Decoration({
  kind,
  className = "",
  label = defaultLabels[kind],
  style,
}: DecorationProps) {
  const lines = label.split("\n");

  return (
    <span
      aria-hidden="true"
      className={`decoration decoration--${kind} ${className}`}
      style={style}
    >
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}
