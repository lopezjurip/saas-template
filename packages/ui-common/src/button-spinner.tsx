"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { useFormStatus } from "react-dom";
import type { PolymorphicProps } from "./polymorphic";
import { buttonVariants } from "./shadcn/components/ui/button";
import { Spinner } from "./shadcn/components/ui/spinner";

type OwnProps = VariantProps<typeof buttonVariants> & {
  /**
   * Explicit pending flag. Overrides `useFormStatus()` when provided.
   * Use this with `useTransition` or direct SDK calls.
   */
  pending?: boolean;
  /**
   * Content to show while pending. Defaults to `children`.
   * @example pendingChildren="Saving…"
   */
  pendingChildren?: React.ReactNode;
};

export type ButtonSpinnerProps<T extends React.ElementType = "button"> = PolymorphicProps<T, OwnProps>;

/**
 * Button that shows a spinner when pending.
 *
 * **Auto-detect** via `useFormStatus()` for `<form action={fn}>` patterns — no extra props needed.
 * **Explicit** via `pending` prop for `useTransition` / SDK call patterns.
 *
 * @example
 * // Auto via form action — useFormStatus() detects pending automatically:
 * <form action={serverAction}>
 *   <ButtonSpinner>Submit</ButtonSpinner>
 * </form>
 *
 * @example
 * // Explicit pending with custom pending label:
 * const [pending, startTransition] = useTransition();
 * <ButtonSpinner pending={pending} pendingChildren="Saving…">Save</ButtonSpinner>
 *
 * @example
 * // Polymorphic — render as anchor:
 * <ButtonSpinner as="a" href="/home" variant="outline">Go home</ButtonSpinner>
 */
export function ButtonSpinner<T extends React.ElementType = "button">({
  as,
  ref,
  pending: pendingProp,
  pendingChildren,
  variant,
  size,
  className,
  children,
  disabled,
  ...props
}: ButtonSpinnerProps<T>) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;
  const Component = (as ?? "button") as React.ElementType;

  return (
    <Component
      ref={ref}
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingChildren ?? children}
        </>
      ) : (
        children
      )}
    </Component>
  );
}
