import { DeleteAccountDialog } from "./delete-account-dialog";

const DELETE_IMPACT = /*#__PURE__*/ [
  { text: "Sales de", strong: "3 organizaciones", tail: "donde tienes acceso." },
  { text: "Tus", strong: "2 tokens activos", tail: "se invalidan en el momento." },
  { text: "Las sesiones en", strong: "todos tus dispositivos", tail: "se cierran." },
  { text: "El correo", strong: "juan@empresa.com", tail: "queda libre para registrarse de nuevo en 30 días." },
];

export default function DangerPage() {
  return (
    <div className="flex max-w-[720px] flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Zona de riesgo
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Eliminar tu cuenta</h1>
        <p className="text-pretty text-[13px] leading-normal text-muted-foreground">
          Al eliminar tu cuenta borramos tus datos personales, sesiones y tokens. Lo que hayas creado dentro de una
          organización sigue siendo de esa organización — habla con su admin si quieres bajarlo antes.
        </p>
      </header>

      <div className="flex flex-col gap-3.5 rounded-xl border border-destructive/50 bg-destructive/[0.04] px-5 py-4 dark:border-[hsl(0_70%_50%/0.45)] dark:bg-[hsl(0_70%_30%/0.1)]">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-destructive dark:text-[hsl(0_70%_70%)]">
            Esto no se puede deshacer.
          </span>
          <span className="text-[12.5px] leading-relaxed text-muted-foreground">
            Antes de continuar, ten en cuenta:
          </span>
        </div>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[12.5px] leading-relaxed text-muted-foreground">
          {DELETE_IMPACT.map((item) => (
            <li key={item.strong}>
              {item.text} <strong className="font-medium text-foreground">{item.strong}</strong> {item.tail}
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between gap-3.5 border-t border-destructive/25 pt-3 dark:border-[hsl(0_70%_50%/0.25)]">
          <span className="max-w-[40ch] text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
            ¿Solo necesitas un descanso? También puedes desactivar la cuenta temporalmente.
          </span>
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}
