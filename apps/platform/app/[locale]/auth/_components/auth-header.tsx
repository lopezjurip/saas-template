export function AuthHeader({ small }: { small?: boolean }) {
  return (
    <div className={`text-center flex flex-col items-center ${small ? "gap-2" : "gap-3"}`}>
      <div className="inline-flex size-10 items-center justify-center rounded-[10px] bg-primary text-[18px] font-bold tracking-tight text-primary-foreground">
        H
      </div>
      <div>
        <h1 className={`m-0 font-semibold tracking-tight ${small ? "text-[18px]" : "text-[22px]"}`}>
          Bienvenido a Humane
        </h1>
        <p
          className={`mt-1 text-muted-foreground ${small ? "text-[12px]" : "text-[13px]"}`}
          style={{ margin: "4px 0 0" }}
        >
          HR y nómina para empresas chilenas
        </p>
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <div className="text-center mt-5">
      <p className="m-0 text-[11px] text-muted-foreground leading-relaxed">
        Al continuar aceptas nuestros{" "}
        <a
          className="cursor-pointer underline decoration-border underline-offset-[3px] hover:decoration-foreground"
          href="/legal"
        >
          Términos
        </a>{" "}
        y{" "}
        <a
          className="cursor-pointer underline decoration-border underline-offset-[3px] hover:decoration-foreground"
          href="/legal"
        >
          Política de privacidad
        </a>
        .
      </p>
    </div>
  );
}
