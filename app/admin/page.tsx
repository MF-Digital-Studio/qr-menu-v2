import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/admin/login-form"

export default async function AdminLoginPage() {
    const session = await auth()
    if (session) redirect("/admin/products")

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm">
                {/* Logo / brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        MF Digital Studio
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Yönetim paneline giriş yapın
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}
