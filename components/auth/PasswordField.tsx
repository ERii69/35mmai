"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { proAuth, proSurface } from "@/components/pro/ux/pro-surfaces";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
};

/** Password input with a control to show or hide the characters. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={proAuth.label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${proSurface.field} pr-11`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-pro-text-secondary transition hover:text-pro-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pro-primary/50"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((show) => !show)}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-pro-text-secondary">{hint}</p> : null}
    </div>
  );
}
