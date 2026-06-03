/**
 * /auth/onboarding/* shares the same card shell as the rest of /auth. Each page (hub +
 * substeps) wraps itself in <AuthCard> and picks its own max-width, so this layout is a
 * passthrough.
 */
export default function OnboardingLayout(props: LayoutProps<"/[locale]/auth/onboarding">) {
  return props.children;
}
