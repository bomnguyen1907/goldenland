import { HeroSection } from './components/HeroSection'
import { FeaturedArticlesSection } from './components/FearturedArticlesSection'
import { FeaturedProjectsSection } from './components/FeaturedProjectsSection'
import { PropertiesByLocationSection } from './components/PropertiesByLocationSection'
import { PropertyForYouSection } from './components/PropertyForYouSection'
import { RealEstateArticlesSection } from './components/RealEstateArticlesSection'

export default function HomePage() {
  return (
    <div className="pt-20">
      <HeroSection />
      <FeaturedArticlesSection />
      <PropertyForYouSection />
      <FeaturedProjectsSection />
      <PropertiesByLocationSection />
      <RealEstateArticlesSection />
    </div>
  )
}
