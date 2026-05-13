import { forwardRef, useId } from "react";

const inputBaseClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const Input = forwardRef(
  (
    {
      id,
      label,
      required = false,
      helperText,
      error,
      leftIcon,
      rightElement,
      className = "",
      inputClassName = "",
      containerClassName = "",
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
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            {label}
            {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
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
              leftIcon ? "pl-9" : "",
              rightElement ? "pr-12" : "",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
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
              "mt-1.5 text-xs",
              error ? "font-medium text-red-600" : "text-slate-500",
            ].join(" ")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
