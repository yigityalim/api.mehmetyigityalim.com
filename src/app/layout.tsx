import type { Metadata } from "next";
import * as crypto from "node:crypto";

export const metadata = {
  title: {
    template: "%s | Mehmet Yiğit Yalım",
    default: "Mehmet Yiğit Yalım",
  },
  description: "API for Mehmet Yiğit Yalım",
  authors: {
    url: "mehmetyigityalim.com",
    name: "Mehmet Yiğit Yalım",
  },
} satisfies Metadata;

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
