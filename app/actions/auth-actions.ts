"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"

const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

export type LoginState = {
    error?: string
    success?: boolean
}

export async function loginAction(
    _prevState: LoginState,
    formData: FormData,
): Promise<LoginState> {
    const raw = {
        email: formData.get("email"),
        password: formData.get("password"),
    }

    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
        const firstError = parsed.error.errors[0]?.message ?? "Geçersiz giriş bilgileri."
        return { error: firstError }
    }

    try {
        await signIn("credentials", {
            email: parsed.data.email,
            password: parsed.data.password,
            redirectTo: "/admin/products",
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "E-posta veya şifre hatalı." }
                default:
                    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." }
            }
        }
        // Next.js throws NEXT_REDIRECT — re-throw it so the redirect works
        throw error
    }
}

export async function signOutAction() {
    await signOut({ redirectTo: "/admin" })
}
