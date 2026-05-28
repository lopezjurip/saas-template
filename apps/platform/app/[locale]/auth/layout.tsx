// Shared shell for every /auth/* page. The card width is up to each child page
// (entry/email/phone use 420px; onboarding hub uses 460px) so we don't constrain
// it here — just centre vertically + paint the background.

import { cn } from "@packages/ui-common/shadcn/lib/utils";

export default async function AuthLayout({
  className,
  ...props
}: LayoutProps<"/[locale]/auth"> & React.ComponentProps<"main">) {
  return <main className={cn("bg-muted/60 flex min-h-svh items-center justify-center p-6", className)} {...props} />;
}
