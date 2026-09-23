import type { ReactNode } from "react";

interface SectionHeadingProps {
  index: string;
  title: string;
  children?: ReactNode;
  invert?: boolean;
}

export function SectionHeading({
  index,
  title,
  children,
  invert = false,
}: SectionHeadingProps) {
  return (
    <header className="mb-10 max-w-3xl md:mb-14">
      <p className="section-index" style={invert ? { color: "var(--accent)" } : undefined}>
        {index}
      </p>
      <h2 className="section-title">{title}</h2>
      {children ? (
        <div className={`type-body mt-5 max-w-xl ${invert ? "opacity-80" : "type-muted"}`}>
          {children}
        </div>
      ) : null}
    </header>
  );
}
