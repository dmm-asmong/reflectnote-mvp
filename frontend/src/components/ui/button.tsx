import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

const toneClasses = {
  primary:
    "bg-surface-dark text-white shadow-md hover:shadow-lg",
  secondary: "border border-black/10 bg-accent-soft text-accent-deep hover:bg-accent-hover",
  ghost: "bg-transparent text-ink-soft hover:bg-black/5",
};

export function Button({ children, className = "", tone = "primary", fullWidth = false, ...props }: ButtonProps) {
  const widthClass = fullWidth ? "w-full justify-center" : "";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone]} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
