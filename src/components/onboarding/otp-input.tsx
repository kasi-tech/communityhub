"use client";

import { useRef, useState, useCallback, type KeyboardEvent, type ClipboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled = false }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
      }
    },
    [length],
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only accept single digits
      const digit = value.replace(/\D/g, "").slice(-1);
      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);

      if (digit && index < length - 1) {
        focusInput(index + 1);
      }

      // Check if all filled
      if (digit && newValues.every((v) => v !== "")) {
        onComplete(newValues.join(""));
      }
    },
    [values, length, focusInput, onComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (values[index]) {
          // Clear current cell
          const newValues = [...values];
          newValues[index] = "";
          setValues(newValues);
        } else if (index > 0) {
          // Move to previous cell and clear it
          focusInput(index - 1);
          const newValues = [...values];
          newValues[index - 1] = "";
          setValues(newValues);
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        focusInput(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        focusInput(index + 1);
        e.preventDefault();
      }
    },
    [values, focusInput],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (pastedData.length === 0) return;

      const newValues = [...values];
      for (let i = 0; i < pastedData.length; i++) {
        newValues[i] = pastedData[i] ?? "";
      }
      setValues(newValues);

      // Focus the next empty or the last filled
      const nextIndex = Math.min(pastedData.length, length - 1);
      focusInput(nextIndex);

      // Auto-submit if all filled
      if (newValues.every((v) => v !== "")) {
        onComplete(newValues.join(""));
      }
    },
    [values, length, focusInput, onComplete],
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="OTP verification code">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-10 rounded-lg border-2 text-center text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl ${
            value
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 focus:ring-indigo-200"
              : "border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
