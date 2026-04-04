export async function handleImageUpload(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  const data = (await response.json().catch(() => ({}))) as {
    url?: string
    error?: string
  }

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Görsel yüklenemedi. Lütfen tekrar deneyin.")
  }

  return data.url
}
