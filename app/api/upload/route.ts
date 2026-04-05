import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Yüklenecek bir görsel bulunamadı." }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG veya WEBP dosyaları kabul edilir." },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Dosya boyutu 5 MB'ı aşamaz." },
        { status: 400 },
      )
    }

    // Sanitize filename — strip path traversal characters
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
    const filename = `uploads/${Date.now()}-${safeName}`

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url }, { status: 200 })
  } catch (error) {
    console.error("[upload] Görsel yükleme hatası", error)

    return NextResponse.json(
      { error: "Görsel yüklenirken bir hata oluştu." },
      { status: 500 },
    )
  }
}
