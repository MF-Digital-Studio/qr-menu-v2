import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: Request) {
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

    const filename = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    console.log("[upload] Dosya yüklendi", {
      name: file.name,
      type: file.type,
      size: file.size,
      url: blob.url,
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
