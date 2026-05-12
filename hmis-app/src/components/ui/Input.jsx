import { forwardRef, useId } from "react";

const inputBaseClasses =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/15 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const Input = forwardRef(
  (
    {
      id,
      label,
      helperText,
      error,
      leftIcon,
      rightElement,
      className = "",
      inputClassName = "",
      containerClassName = "",
      required = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId =
      error || helperText ? `${inputId}-description` : undefined;

    return (
      <div className={["w-full", containerClassName].join(" ")}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
          >
            {label}
            {required && <span className="text-xs text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400 transition-colors group-focus-within:text-cyan-500">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={descriptionId}
            className={[
              inputBaseClasses,
              leftIcon ? "pl-10" : "",
              rightElement ? "pr-12" : "",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-500/15"
                : "",
              inputClassName,
              className,
            ].join(" ")}
            {...props}
          />

          {rightElement && (
            <span className="absolute inset-y-0 right-2 flex items-center">
              {rightElement}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={descriptionId}
            className={[
              "mt-1.5 flex items-center gap-1.5 text-xs",
              error ? "font-medium text-red-600" : "text-slate-500",
            ].join(" ")}
          >
            {error && (
              <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
