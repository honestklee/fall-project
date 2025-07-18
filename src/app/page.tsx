import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  const role = session.user.role;

  if (role === "SUPER_ADMIN") return redirect("/dashboard/admin");
  if (role === "ADMIN") return redirect("/dashboard/admin");
  if (role === "PATIENT") return redirect("/dashboard/patient");

  return <div>Unknown role</div>;
}
