import AchievementsPreview from '../components/AchievementsPreview'
import Footer from '../components/Footer'
import WorkshopPreview from '../components/WorkshopPreview'
import AboutPreview from '../components/AboutPreview'
import FeaturedProjects from '../components/FeaturedProjects'
import Hero from '../components/Hero'
import Services from '../components/Services'

function Home() {
  return (
    <main>

      <Hero />

      <Services />

      <FeaturedProjects />

      <AboutPreview />

      <WorkshopPreview />

      <AchievementsPreview />
      <Footer />

    </main>
  )
}

export default Home