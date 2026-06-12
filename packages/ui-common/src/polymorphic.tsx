/**
 * Props for a polymorphic component. Includes `ref` (React 19+ ref-as-prop).
 *
 * @example
 * type ButtonProps<T extends React.ElementType = "button"> = PolymorphicProps<
 *   T,
 *   { variant?: "primary" | "ghost" }
 * >;
 *
 * function Button<T extends React.ElementType = "button">({
 *   as,
 *   ref,
 *   variant,
 *   ...props
 * }: ButtonProps<T>) {
 *   const Component = as || "button";
 *   return <Component ref={ref} {...props} />;
 * }
 *
 * // Usage:
 * <Button as="a" href="/home" variant="primary">Go home</Button>
 * <Button ref={myRef}>Click</Button>
 */
export type PolymorphicProps<T extends React.ElementType, Props = object> = Props & {
  as?: T;
} & Omit<React.ComponentPropsWithRef<T>, keyof Props | "as">;
