import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin Dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
