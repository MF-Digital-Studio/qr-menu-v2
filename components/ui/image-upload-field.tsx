"use client"

import { useRef } from "react"
import { Upload } from "lucide-react"

interface ImageUploadFieldProps {
  label: string
  previewUrl?: string
  inputId: string
  onFileSelect: (file: File | null) => void
}

export function ImageUploadField({ label, previewUrl, inputId, onFileSelect }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSelectedFile = (file?: File | null) => {
    onFileSelect(file ?? null)
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleSelectedFile(event.target.files?.[0])}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          handleSelectedFile(event.dataTransfer.files?.[0])
        }}
        className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-linear-to-br from-slate-50 to-white p-4 text-center shadow-sm transition hover:border-slate-900 hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        {previewUrl ? (
          <div className="mb-4 h-40 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img src={previewUrl} alt="Yüklenen görsel önizlemesi" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Upload className="h-6 w-6" />
          </div>
        )}

        <p className="text-sm font-semibold text-slate-900">Görsel Yükle</p>
        <p className="mt-1 text-sm text-slate-500">Dosya Seç veya Sürükle</p>
        <p className="mt-1 text-xs text-slate-400">JPEG, PNG veya WEBP</p>
      </div>
    </div>
  )
}
