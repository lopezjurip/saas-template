// /auth/onboarding/* shares the same card shell as the rest of /auth. The hub is a touch
// wider than substep pages, so we widen the card here and let the auth layout handle the
// outer centering + background.

export default function OnboardingLayout(props: LayoutProps<"/[locale]/auth/onboarding">) {
  return <div className="-mx-2">{props.children}</div>;
}
