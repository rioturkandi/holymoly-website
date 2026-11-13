import { useCallback, useRef, useState } from 'react'
import { Cropper, RectangleStencil } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'

function ImageCropEditor({ src, onApply, onCancel }) {
  const cropperRef = useRef(null)
  const [preview, setPreview] = useState('')

  // Membuat preview terbaru setiap area crop berubah.
  const updatePreview = useCallback((cropper) => {
    const canvas = cropper.getCanvas()

    if (canvas) {
      setPreview(canvas.toDataURL('image/webp', 0.9))
    }
  }, [])

  // Mengambil hasil crop sebagai file Blob WebP.
  const handleApply = () => {
    const canvas = cropperRef.current?.getCanvas()

    if (!canvas) {
      return
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onApply(blob)
        }
      },
      'image/webp',
      0.9
    )
  }

  // Mengembalikan posisi dan ukuran crop ke kondisi awal.
  const handleReset = () => {
    cropperRef.current?.reset()
  }

  // Memperbesar atau memperkecil gambar di area crop.
  const handleZoomIn = () => {
    cropperRef.current?.zoomImage(1.1)
  }

  const handleZoomOut = () => {
    cropperRef.current?.zoomImage(0.9)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/90 p-4">
      <div className="my-auto w-full max-w-5xl rounded-lg border border-white/15 bg-[#111] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase text-[#E5E7EB]">
              Adjust Image
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Atur posisi dan ukuran gambar dengan rasio 16:9.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-white/60 transition hover:text-white"
          >
            Cancel
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded border border-white/10 bg-black">
              <Cropper
                ref={cropperRef}
                src={src}
                stencilComponent={RectangleStencil}
                stencilProps={{
                  aspectRatio: 16 / 9,
                  movable: true,
                  resizable: true,
                }}
                onReady={updatePreview}
                onUpdate={updatePreview}
                className="h-[280px] w-full sm:h-[420px]"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                className="border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                − Zoom Out
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                className="border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                + Zoom In
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Reset Crop
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#E5E7EB]">
              Live Preview
            </h3>

            <div className="aspect-video overflow-hidden rounded border border-white/10 bg-black">
              {preview ? (
                <img
                  src={preview}
                  alt="Crop preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  Preview loading...
                </div>
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/40">
              Area yang terlihat pada preview adalah gambar yang akan
              disimpan dan ditampilkan di website.
            </p>

            <button
              type="button"
              onClick={handleApply}
              className="mt-6 w-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-white/80"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCropEditor
