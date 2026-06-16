export default function AgencyLayout(props: LayoutProps<"/a">) {
  // Locale/theme controls used to float here via <FloatingChrome/>; they now live
  // inside the agency nav (see a/[agency_slug]/agency-nav.tsx). This layout is a
  // thin pass-through so the agency surface keeps its own route boundary.
  return props.children;
}
