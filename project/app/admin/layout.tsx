import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Panel Admin | Peón Pet's",
  description: "Panel de administración interno.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {children}
    </div>
  );
}
