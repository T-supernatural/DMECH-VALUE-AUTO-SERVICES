import type { Metadata } from "next";
import "./globals.css";
import { AcademyShell } from "@academy-components/AcademyShell";

export const metadata: Metadata = {
  title: "DMECH Academy",
  description: "Professional automotive technician training by DMECH.",
};

export default function AcademyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html