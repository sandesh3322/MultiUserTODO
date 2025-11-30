import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

// --- Interfaces ---
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  admin: AdminData;
  users: User[];
}

// Fetch admin + users on the server
async function fetchAdminAndUsers(): Promise<Props> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/auth/login");

  const headers = { authorization: `Bearer ${token}` };

  // Admin auth
  const authRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/admin`, { headers });
  const authData = await authRes.json();
  if (!authRes.ok || authData.result.role !== "admin") redirect("/auth/login");

  // Users
  const usersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, { headers });
  const usersData = await usersRes.json();

  return { admin: authData.result, users: usersData.result ?? [] };
}

export default async function AdminDashboardPage() {
  const { admin, users } = await fetchAdminAndUsers();
  return <AdminDashboardClient admin={admin} users={users} />;
}
