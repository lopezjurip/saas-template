import type { Metadata } from "next";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Humane — HR y Nómina para empresas chilenas",
  description: "La plataforma de RR.HH. y nómina más simple para empresas de 50–250 personas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
