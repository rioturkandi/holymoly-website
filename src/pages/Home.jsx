import { useEffect, useState } from 'react'

import { apiRequest } from '../services/api'

import AchievementsPreview from '../components/AchievementsPreview'
import Footer from '../components/Footer'
import WorkshopPreview from '../components/WorkshopPreview'
import AboutPreview from '../components/AboutPreview'
import FeaturedProjects from '../components/FeaturedProjects'
import Hero from '../components/Hero'
import Services from '../components/Services'

function Home() {
  // Menyimpan data Home yang diterima dari backend
  const [homeData, setHomeData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Mengambil data Home ketika halaman pertama kali dibuka
  useEffect(() => {
    let isMounted = true

    async function fetchHomeData() {
      try {
        const response = await apiRequest('/api/home')

        // Memastikan respons backend memiliki struktur yang benar
        if (!response?.success || !response?.data) {
          throw new Error('Format respons API Home tidak valid.')
        }

        // Menyimpan data jika komponen masih aktif
        if (isMounted) {
          setHomeData(response.data)
        }
      } catch (error) {
        console.error('Gagal memuat konten Home:', error)

        if (isMounted) {
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchHomeData()

    // Mencegah pembaruan state setelah komponen dilepas
    return () => {
      isMounted = false
    }
  }, [])

  // Mengambil daftar konten dari respons backend
  const content = homeData?.content ?? []

  // Memisahkan konten berdasarkan section_key
  const heroContent =
    content.find((item) => item.section_key === 'hero') ?? null

  const servicesContent =
    content.find((item) => item.section_key === 'services') ?? null

  // Mengambil daftar layanan
  const services = homeData?.services ?? []

  return (
    <main>
      <Hero
        content={heroContent}
        isLoading={isLoading}
        hasError={hasError}
      />

      <Services
        content={servicesContent}
        services={services}
        isLoading={isLoading}
        hasError={hasError}
      />

      <FeaturedProjects />

      <AboutPreview />

      <WorkshopPreview />

      <AchievementsPreview />

      <Footer />
    </main>
  )
}

export default Home
