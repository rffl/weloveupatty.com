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

export type DecorationStyle = CSSProperties & {
  "--rotation"?: string;
  "--piece-z"?: string | number;
};

type DecorationProps = {
  kind: DecorationKind;
  className?: string;
  label?: string;
  style?: DecorationStyle;
};

const defaultLabels: Record<DecorationKind, string> = {
  tape: "",
  stamp: "",
  ticket: "",
  receipt: "",
  doodle: "",
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
