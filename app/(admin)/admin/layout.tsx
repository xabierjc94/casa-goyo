import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only check authentication for non-login routes
  // The login page will handle its own auth state
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only redirect if we're not on the login page
  // We check this by seeing if there's a user - if there's no user
  // they should be on /admin/login, not here
  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-crema">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
