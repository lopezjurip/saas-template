export default function HomeLayout(props: LayoutProps<"/home">) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto">{props.children}</div>
    </div>
  );
}
