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
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Content Management
          </p>
          <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            About.
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Manage your company introduction, journey, vision, mission, and philosophy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-black disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {isLoading && (
        <p className="mt-10 text-sm text-neutral-400">
          Loading About content...
        </p>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-10 border border-red-500/30 bg-red-500/5 p-5">
          <p className="text-sm text-red-400">
            Failed to load About content.
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 text-sm underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-10 space-y-8">
          {sections.map((section) => {
            const isBusy =
              savingKey === section.section_key ||
              deletingKey === section.section_key

            return (
              <form
                key={section.section_key}
                onSubmit={(event) => handleSave(event, section)}
                className="border border-white/10 bg-white/[0.02] p-5 sm:p-7"
              >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold uppercase">
                    {section.label}
                  </h2>

                  <span className="text-xs uppercase tracking-wider text-neutral-500">
                    {section.section_key}
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor={`${section.section_key}-eyebrow`}
                      className="mb-2 block text-sm text-neutral-300"
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
                      className="w-full border border-white/20 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${section.section_key}-title`}
                      className="mb-2 block text-sm text-neutral-300"
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
                      className="w-full border border-white/20 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${section.section_key}-description`}
                      className="mb-2 block text-sm text-neutral-300"
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
                      className="w-full resize-y border border-white/20 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />
                    <p className="mt-1 text-right text-xs text-neutral-500">
                      {section.description.length}/5000
                    </p>
                  </div>

                </div>

                {messages[section.section_key] && (
                  <p className="mt-5 text-sm text-green-400">
                    {messages[section.section_key]}
                  </p>
                )}

                {errors[section.section_key] && (
                  <p className="mt-5 text-sm text-red-400">
                    {errors[section.section_key]}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="mt-6 border border-white bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingKey === section.section_key
                    ? 'Saving...'
                    : 'Save Section'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(section)}
                  disabled={isBusy}
                  className="mt-6 ml-3 border border-red-500/60 px-6 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingKey === section.section_key
                    ? 'Deleting...'
                    : 'Delete Section'}
                </button>
              </form>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminAbout
