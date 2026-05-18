import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite Gaming Cup | Davivienda × Tigo Sports",
  description:
    "Inscríbete al torneo Elite Gaming Cup patrocinado por Davivienda y Tigo Sports. ¡Asegura tu lugar y compite por el campeonato!",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
