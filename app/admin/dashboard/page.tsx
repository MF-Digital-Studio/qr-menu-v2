import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { signOutAction } from "@/app/actions/auth-actions"
import { LogOut } from "lucide-react"

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/admin")

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm text-center">
                <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-2xl">👋</span>
                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Welcome to MF Digital Studio
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Hoş geldiniz,{" "}
                    <span className="font-medium text-foreground">
                        {session.user?.name ?? session.user?.email}
                    </span>
                </p>

                <form action={signOutAction} className="mt-6">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                        <LogOut className="size-4" />
                        Çıkış Yap
                    </button>
                </form>
            </div>
        </div>
    )
}
