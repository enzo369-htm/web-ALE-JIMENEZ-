import { LoginForm } from "@/core/auth";

export default function AdminLoginPage() {
  return <LoginForm redirectTo="/admin" title="Studio Admin" />;
}
