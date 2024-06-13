import type { Metadata } from "next";
import React from "react";

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

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
