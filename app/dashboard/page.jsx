// app/dashboard/page.jsx
import { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Ops Hub — Digital Service Bay Admin",
  description: "Admin dashboard: manage bookings, track revenue, toggle availability.",
  robots: { index: false, follow: false }, // keep out of search engines
};

export default function DashboardPage() {
  return <DashboardClient />;
}
