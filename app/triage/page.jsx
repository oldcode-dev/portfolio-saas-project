// app/triage/page.jsx
import { Metadata } from "next";
import TriageBot from "@/components/triage/TriageBot";

export const metadata = {
  title: "Diagnose Your Issue — Digital Service Bay",
  description: "Answer 3 questions and get an instant diagnosis with transparent pricing.",
};

export default function TriagePage() {
  return <TriageBot />;
}
