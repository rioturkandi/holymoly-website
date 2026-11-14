import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function ProjectShowcaseCard({
  project,
  linkTo,
  onDelete,
  isDeleting = false,
  clampDescription = false,
  variant = 'default',
}) {
  const [activeIndex, setActiveIndex] = useState(
    Math.min(1, (project.gallery || []).length - 1)
  )

  const dragStartX = useRef(null)
  const isDragging = useRef(false)

  const gallery = project.gallery || []
  const total = gallery.length

  // Menggeser posisi foto carousel.
  function moveGallery(direction) {
    setActiveIndex((current) => current + direction)
  }

  // Menggeser carousel menggunakan mouse atau sentuhan.
  function handlePointerEnd(event) {
    if (dragStartX.current === null) return

    const distance = event.clientX - dragStartX.current
    isDragging.current = Math.abs(distance) > 35

    if (isDragging.current) {
      moveGallery(distance < 0 ? 1 : -1)
    }

    dragStartX.current = null
  }

  // Memilih foto yang diklik melalui posisi terdekat di carousel.
  function handleGalleryClick(photoIndex) {
    if (isDragging.current) {
      isDragging.current = false
      return
    }

    const nearestIndex =
      photoIndex +
      Math.round((activeIndex - photoIndex) / total) * total

    setActiveIndex(nearestIndex)
  }

  const vehicleName = project.vehicle_name
  const cover = project.cover

  return (
    <article className="@container min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
      <div className={variant === 'featured' ? 'p-3 pb-0 min-[390px]:p-4' : 'p-4 pb-0'}>
        <h3 className={`break-words font-bold uppercase text-[#E5E7EB] ${
          variant === 'featured'
            ? 'text-[14px] min-[360px]:text-[15px] min-[390px]:text-[16px] sm:text-xl md:text-2xl'
            : 'text-lg'
        }`}>
          {linkTo ? (
            <Link to={linkTo} className="transition-colors hover:text-zinc-300">
              {vehicleName}
            </Link>
          ) : (
            vehicleName
          )}
        </h3>
      </div>

      {cover?.image_path && (
        <div className={variant === 'featured' ? 'mt-3 px-3 min-[390px]:mt-4 min-[390px]:px-4' : 'mt-4 px-4'}>
          {linkTo ? (
            <Link to={linkTo} className="block">
              <img
                src={cover.image_path}
                alt={`${vehicleName} Cover`}
                style={{
                  objectPosition: `${cover.position_x ?? 50}% ${cover.position_y ?? 50}%`,
                }}
                className="aspect-square w-full rounded-lg bg-zinc-900 object-cover"
              />
            </Link>
          ) : (
            <img
              src={cover.image_path}
              alt={`${vehicleName} Cover`}
              style={{
                objectPosition: `${cover.position_x ?? 50}% ${cover.position_y ?? 50}%`,
              }}
              className="aspect-square w-full rounded-lg bg-zinc-900 object-cover"
            />
          )}
        </div>
      )}

      <div className={variant === 'featured' ? 'space-y-4 p-3 min-[390px]:space-y-5 min-[390px]:p-4' : 'space-y-5 p-4'}>
        {total > 0 && (
          <section>
            <p className={`mb-3 font-semibold uppercase tracking-wider text-zinc-500 ${
              variant === 'featured'
                ? 'text-[9px] min-[360px]:text-[10px] min-[390px]:text-[11px] sm:text-xs'
                : 'mb-4 text-xs'
            }`}>
              Detail Photos
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Foto sebelumnya"
                onClick={() => moveGallery(-1)}
                className={`flex shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xl text-white transition-all duration-300 hover:scale-110 hover:bg-zinc-800 ${
                  variant === 'featured'
                    ? 'h-8 w-8 min-[390px]:h-9 min-[390px]:w-9'
                    : 'h-9 w-9'
                }`}
              >
                ←
              </button>

              <div
                className="relative aspect-[3.4/1] min-w-0 flex-1 cursor-grab select-none touch-pan-y overflow-hidden active:cursor-grabbing"
                onPointerDown={(event) => {
                  if (event.pointerType === 'mouse' && event.button !== 0) return
                  dragStartX.current = event.clientX
                }}
                onPointerUp={handlePointerEnd}
                onPointerCancel={() => {
                  dragStartX.current = null
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const absoluteIndex = activeIndex + offset
                  const photoIndex = ((absoluteIndex % total) + total) % total
                  const photo = gallery[photoIndex]

                  return (
                    <div
                      key={`${absoluteIndex}-${photo.id || photo.image_path}`}
                      className="absolute left-1/2 top-1/2 w-[calc(33.333%-8px)] cursor-pointer"
                      onClick={() => handleGalleryClick(photoIndex)}
                      style={{
                        transform: `translate(calc(-50% + ${offset * 100}%), -50%) scale(${offset === 0 ? 1.08 : offset === -1 || offset === 1 ? 0.98 : 0.75})`,
                        transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                        zIndex: 3 - Math.abs(offset),
                        willChange: 'transform',
                      }}
                    >
                      <img
                        src={photo.image_path}
                        alt={`${vehicleName} Detail ${photoIndex + 1}`}
                        draggable="false"
                        className="aspect-[4/3] h-auto w-full rounded-lg object-cover shadow-lg"
                      />
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                aria-label="Foto berikutnya"
                onClick={() => moveGallery(1)}
                className={`flex shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xl text-white transition-all duration-300 hover:scale-110 hover:bg-zinc-800 ${
                  variant === 'featured'
                    ? 'h-8 w-8 min-[390px]:h-9 min-[390px]:w-9'
                    : 'h-9 w-9'
                }`}
              >
                →
              </button>
            </div>

            <p className="mt-1 text-center text-xs text-zinc-500">
              {((activeIndex % total + total) % total) + 1}
              {' / '}
              {total}
            </p>
          </section>
        )}

        <p
          className={`w-full min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] border-t border-zinc-800 leading-relaxed text-zinc-400 ${
            variant === 'featured'
              ? 'pt-3 text-[11px] min-[360px]:text-xs min-[390px]:pt-4 min-[390px]:text-[13px] sm:text-sm'
              : 'pt-4 text-sm'
          } ${
            clampDescription ? 'line-clamp-3' : ''
          }`}
        >
          {project.description}
        </p>

        {onDelete && (
          <div className="flex flex-col gap-3 border-t border-zinc-800 pt-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <p className="text-xs text-zinc-500">
              {total} detail photos
            </p>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="w-full rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50 @sm:w-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default ProjectShowcaseCard
