import { useRef, useState } from 'react'
import { Upload, X, Loader } from 'lucide-react'
import { uploadProductPhoto } from '../../../lib/queries/products'

interface PhotoUploaderProps {
  value: string
  onChange: (url: string) => void
}

export function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return }
    setError(null)
    setUploading(true)
    try {
      const url = await uploadProductPhoto(file)
      onChange(url)
    } catch {
      setError('Error al subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors"
        style={{ minHeight: 160 }}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="w-full h-40 object-contain bg-gray-50" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-gray-600 hover:text-red-500 transition-colors shadow-sm border border-gray-200"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2.5 text-gray-400">
            {uploading
              ? <Loader size={22} className="animate-spin text-forest-700" />
              : <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <p className="text-sm">Arrastra o haz clic para subir foto</p>
                  <p className="text-xs text-gray-300">PNG, JPG, WEBP</p>
                </>
            }
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
