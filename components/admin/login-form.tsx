"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { loginAction, type LoginState } from "@/app/actions/auth-actions"
import { Home, Loader2 } from "lucide-react"

const initialState: LoginState = {}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? (
                <>
                    <Loader2 className="size-4 animate-spin" />
                    Giriş yapılıyor…
                </>
            ) : (
                "Giriş Yap"
            )}
        </button>
    )
}

export function LoginForm() {
    const [state, action] = useActionState(loginAction, initialState)

    useEffect(() => {
        if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <form action={action} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground"
                    >
                        E-posta
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="admin@example.com"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-foreground"
                    >
                        Şifre
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    />
                </div>

                <SubmitButton />

                <Link
                    href="/"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <Home className="size-4" />
                    Ana Sayfaya Dön
                </Link>
            </form>
        </div>
    )
}
