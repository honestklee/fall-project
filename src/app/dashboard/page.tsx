import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    select: { role: true },
  });

  if (!user) {
    redirect("/login");
  }

  // Redirect based on role
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (user.role === "PATIENT") {
    redirect("/dashboard/patient");
  } else {
    redirect("/login");
  }
}
