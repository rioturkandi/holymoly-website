import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'

const DEFAULT_SECTIONS = [
  { section_key: 'introduction', label: 'Introduction' },
  { section_key: 'journey', label: 'Our Journey' },
  { section_key: 'vision', label: 'Vision' },
  { section_key: 'mission', label: 'Mission' },
  { section_key: 'philosophy', label: 'Philosophy' },
]

function createEmptySections() {
  return DEFAULT_SECTIONS.map((section) => ({
    ...section,
    eyebrow: '',
    title: '',
    description: '',
  }))
}

function AdminAbout() {
  const [sections, setSections] = useState(createEmptySections)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [deletingKey, setDeletingKey] = useState(null)
  const [savingKey, setSavingKey] = useState(null)
  const [messages, setMessages] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let isMounted = true

    async function loadAboutData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await apiRequest('/api/admin/about', {
          auth: true,
        })

        const savedSections = Array.isArray(response.data)
          ? response.data
          : []

        const mergedSections = DEFAULT_SECTIONS.map((section) => {
          const saved = savedSections.find(
            (item) => item.section_key === section.section_key,
          )

          return {
            ...section,
            eyebrow: saved?.eyebrow || '',
            title: saved?.title || '',
            description: saved?.description || '',
          }
        })

        if (isMounted) {
          setSections(mergedSections)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAboutData()

  return () => {
      isMounted = false
    }
  }, [refreshKey])

  async function handleDelete(section) {
    const sectionKey = section.section_key

    const confirmed = window.confirm(
      `Hapus konten custom ${section.label}? Website publik akan kembali menggunakan teks default.`
    )

    if (!confirmed) return

    setDeletingKey(sectionKey)
    setMessages((current) => ({ ...current, [sectionKey]: '' }))
    setErrors((current) => ({ ...current, [sectionKey]: '' }))

    try {
      await apiRequest(`/api/admin/about/${sectionKey}`, {
        method: 'DELETE',
        auth: true,
      })

      setSections((current) =>
        current.map((item) =>
          item.section_key === sectionKey
            ? { ...item, eyebrow: '', title: '', description: '' }
            : item
        )
      )

      setMessages((current) => ({
        ...current,
        [sectionKey]: 'Konten custom berhasil dihapus. Teks default akan digunakan.',
      }))
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [sectionKey]: error.message,
      }))
    } finally {
      setDeletingKey(null)
    }
  }

  function handleRefresh() {
    setRefreshKey((current) => current + 1)
  }

  function updateSection(sectionKey, field, value) {
    setSections((current) =>
      current.map((section) =>
        section.section_key === sectionKey
          ? { ...section, [field]: value }
          : section,
      ),
    )
  }

  async function handleSave(event, section) {
    event.preventDefault()

    const sectionKey = section.section_key

    setSavingKey(sectionKey)
    setMessages((current) => ({ ...current, [sectionKey]: '' }))
    setErrors((current) => ({ ...current, [sectionKey]: '' }))

    try {
      await apiRequest(`/api/admin/about/${sectionKey}`, {
        method: 'PUT',
        auth: true,
        body: {
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
        },
      })

      setMessages((current) => ({
        ...current,
        [sectionKey]: 'Perubahan berhasil disimpan.',
      }))
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [sectionKey]: error.message,
      }))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 min-[390px]:gap-4">
        <div className="min-w-0">
          <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
            Content Management
          </p>
          <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:mt-3 min-[390px]:text-[34px] sm:text-5xl md:text-6xl">
            About.
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:mt-3 min-[390px]:text-sm">
            Manage your company introduction, journey, vision, mission, and philosophy.
          </p>
        </div>

      </div>

      {isLoading && (
        <p className="mt-8 text-xs text-neutral-400 min-[390px]:mt-10 min-[390px]:text-sm">
          Loading About content...
        </p>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-8 min-w-0 border border-red-500/30 bg-red-500/5 p-3 min-[390px]:mt-10 min-[390px]:p-5">
          <p className="text-xs text-red-400 min-[390px]:text-sm">
            Failed to load About content.
          </p>
          <p className="mt-2 break-words text-xs text-neutral-400 min-[390px]:text-sm">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 min-h-11 text-xs underline underline-offset-4 min-[390px]:text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-8 min-w-0 space-y-6 min-[390px]:mt-10 min-[390px]:space-y-8">
          {sections.map((section) => {
            const isBusy =
              savingKey === section.section_key ||
              deletingKey === section.section_key

            return (
              <form
                key={section.section_key}
                onSubmit={(event) => handleSave(event, section)}
                className="admin-card min-w-0 p-4 min-[390px]:p-5 sm:p-7"
              >
                <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-2 min-[390px]:mb-6 min-[390px]:gap-3">
                  <h2 className="text-base font-bold uppercase text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
                    {section.label}
                  </h2>

                  <span className="break-all text-[10px] uppercase tracking-wider text-neutral-500 min-[390px]:text-xs">
                    {section.section_key}
                  </span>
                </div>

                <div className="min-w-0 space-y-4 min-[390px]:space-y-5">
                  <div>
                    <label
                      htmlFor={`${section.section_key}-eyebrow`}
                      className="mb-2 block text-xs text-neutral-300 min-[360px]:text-[13px] min-[390px]:text-sm"
                    >
                      Eyebrow
                    </label>
                    <input
                      id={`${section.section_key}-eyebrow`}
                      type="text"
                      maxLength={150}
                      value={section.eyebrow}
                      onChange={(event) =>
                        updateSection(section.section_key, 'eyebrow', event.target.value)
                      }
                      className="min-h-11 w-full min-w-0 rounded-sm border border-white/20 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-white min-[360px]:px-4 min-[390px]:text-[13px] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${section.section_key}-title`}
                      className="mb-2 block text-xs text-neutral-300 min-[360px]:text-[13px] min-[390px]:text-sm"
                    >
                      Title
                    </label>
                    <input
                      id={`${section.section_key}-title`}
                      type="text"
                      maxLength={255}
                      value={section.title}
                      onChange={(event) =>
                        updateSection(section.section_key, 'title', event.target.value)
                      }
                      className="min-h-11 w-full min-w-0 rounded-sm border border-white/20 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-white min-[360px]:px-4 min-[390px]:text-[13px] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${section.section_key}-description`}
                      className="mb-2 block text-xs text-neutral-300 min-[360px]:text-[13px] min-[390px]:text-sm"
                    >
                      Description
                    </label>
                    <textarea
                      id={`${section.section_key}-description`}
                      rows={5}
                      maxLength={5000}
                      value={section.description}
                      onChange={(event) =>
                        updateSection(section.section_key, 'description', event.target.value)
                      }
                      className="min-h-32 w-full min-w-0 resize-y rounded-sm border border-white/20 bg-black px-3 py-2.5 text-xs leading-relaxed text-white outline-none focus:border-white min-[360px]:px-4 min-[390px]:text-[13px] sm:text-sm"
                    />
                    <p className="mt-1 text-right text-[11px] text-neutral-500 min-[390px]:text-xs">
                      {section.description.length}/5000
                    </p>
                  </div>

                </div>

                {messages[section.section_key] && (
                  <p className="mt-4 break-words text-xs leading-relaxed text-green-400 min-[390px]:mt-5 min-[390px]:text-sm">
                    {messages[section.section_key]}
                  </p>
                )}

                {errors[section.section_key] && (
                  <p className="mt-4 break-words text-xs leading-relaxed text-red-400 min-[390px]:mt-5 min-[390px]:text-sm">
                    {errors[section.section_key]}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-3 min-[390px]:mt-6 min-[390px]:flex-row min-[390px]:flex-wrap">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="min-h-11 w-full border border-white bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:w-auto min-[390px]:px-6 min-[390px]:text-sm"
                >
                  {savingKey === section.section_key
                    ? 'Saving...'
                    : 'Save Section'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(section)}
                  disabled={isBusy}
                  className="min-h-11 w-full border border-red-500/60 px-4 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:w-auto min-[390px]:px-6 min-[390px]:text-sm"
                >
                  {deletingKey === section.section_key
                    ? 'Deleting...'
                    : 'Delete Section'}
                </button>
                </div>
              </form>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminAbout
