"use client";

import dynamic from "next/dynamic";

const SidebarNoSSR = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
  loading: () => <aside className="hidden lg:flex w-64 shrink-0 no-print" aria-hidden />,
});

export default function SidebarClient() {
  return <SidebarNoSSR />;
}
