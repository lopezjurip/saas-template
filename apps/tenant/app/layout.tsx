import type { Metadata } from "next";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Humane",
  description: "HR y Nómina para empresas chilenas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
