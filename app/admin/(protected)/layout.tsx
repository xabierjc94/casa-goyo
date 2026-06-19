import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="h-screen overflow-hidden bg-crema flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
