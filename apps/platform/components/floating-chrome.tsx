import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";

export function FloatingChrome() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <LocaleToggle />
      <ThemeToggle />
    </div>
  );
}
