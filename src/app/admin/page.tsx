import { requireAdmin } from "@/lib/auth-guards"
import { Header } from "@/components/header"
import { AdminDashboard } from "./admin-client"

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <AdminDashboard />
      </main>
    </div>
  )
}
