import { useRef, useState } from 'react'
import { Upload, X, Loader, ImagePlus } from 'lucide-react'
import { uploadProductPhoto } from '../../../lib/queries/products'

interface MultiPhotoUploaderProps {
  values: string[]
  onChange: (urls: string[]) => void
  max?: number
}

export function MultiPhotoUploader({ values, onChange, max = 8 }: MultiPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) { setError('Apenas imagens são permitidas.'); return }
    if (values.length + arr.length > max) {
      setError(`Máximo de ${max} fotos por produto.`)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const urls = await Promise.all(arr.map((f) => uploadProductPhoto(f)))
      onChange([...values, ...urls])
    } catch {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  function move(from: number, to: number) {
    const arr = [...values]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    onChange(arr)
  }

  const canAdd = values.length < max

  return (
    <div className="space-y-3">
      {/* Grid de fotos */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {values.map((url, i) => (
            <div key={url + i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button type="button" onClick={() => move(i, i - 1)}
                    title="Mover para esquerda"
                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 hover:bg-white text-xs font-bold flex items-center justify-center transition-colors">
                    ←
                  </button>
                )}
                {i < values.length - 1 && (
                  <button type="button" onClick={() => move(i, i + 1)}
                    title="Mover para direita"
                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 hover:bg-white text-xs font-bold flex items-center justify-center transition-colors">
                    →
                  </button>
                )}
              </div>

              {/* Badge "capa" na primeira foto */}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider bg-ink-900 text-white px-1.5 py-0.5 rounded-md">
                  Capa
                </span>
              )}

              {/* Botão remover */}
              <button type="button" onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-sm border border-gray-200 transition-colors">
                <X size={11} />
              </button>
            </div>
          ))}

          {/* Botão adicionar no grid */}
          {canAdd && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-coffee-400 hover:bg-coffee-50/30 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-coffee-600 transition-colors">
              {uploading
                ? <Loader size={18} className="animate-spin text-coffee-600" />
                : <>
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-medium">Adicionar</span>
                  </>
              }
            </button>
          )}
        </div>
      )}

      {/* Área de drop (quando não tem fotos ainda) */}
      {values.length === 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl hover:border-coffee-400 hover:bg-coffee-50/30 transition-colors cursor-pointer"
          style={{ minHeight: 140 }}
        >
          <div className="flex flex-col items-center justify-center h-36 gap-2.5 text-gray-400">
            {uploading
              ? <Loader size={22} className="animate-spin text-coffee-600" />
              : <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <p className="text-sm">Arraste ou clique para enviar fotos</p>
                  <p className="text-xs text-gray-300">PNG, JPG, WEBP · Máx. {max} fotos</p>
                </>
            }
          </div>
        </div>
      )}

      {/* Barra inferior quando já tem fotos */}
      {values.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{values.length} de {max} fotos · A primeira é a capa</span>
          {canAdd && !uploading && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-coffee-600 hover:text-coffee-500 font-medium transition-colors">
              <ImagePlus size={12} />
              Adicionar mais
            </button>
          )}
          {uploading && (
            <span className="flex items-center gap-1 text-coffee-600">
              <Loader size={11} className="animate-spin" /> Enviando…
            </span>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
