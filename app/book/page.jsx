// app/book/page.jsx
// searchParams are available in Next.js page props (server-side read)
// The actual booking flow is a Client Component.

import { Metadata } from "next";
import BookingFlow from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Book a Service — Digital Service Bay",
  description: "Select a time slot, provide your details, and pay a deposit to confirm your booking.",
};

// searchParams passed by Next.js — lets us pre-select service from URL
// e.g. /book?service=malware&icon=🛡️&price=₦6%2C000&deposit=₦3%2C000
export default function BookPage({ searchParams }) {
  const preselect = searchParams?.service
    ? {
        service:  searchParams.service,
        icon:     searchParams.icon     || "🔧",
        price:    searchParams.price    || null,
        deposit:  searchParams.deposit  || "₦2,000",
        urgency:  searchParams.urgency  || "MEDIUM",
        duration: searchParams.duration || null,
      }
    : null;

  return <BookingFlow preselect={preselect} />;
}
