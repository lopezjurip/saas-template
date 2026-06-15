import Link from "next/link";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import { ROUTE } from "~/lib/route";

export default function HomeLayout(props: LayoutProps<"/home">) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-border flex shrink-0 items-center justify-end gap-2 border-b px-4 py-2">
        <Link href={ROUTE("/home/inbox")} className="text-muted-foreground hover:text-foreground text-xs" />
        <ConversationsBell scope={{ kind: "personal" }} compact={true} placement="down" />
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{props.children}</div>
    </div>
  );
}
