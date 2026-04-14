import { HeroSection } from './components/HeroSection'
import { FeaturedNewsSection } from './components/FearturedNewsSection'
import { FeaturedPropertiesSection } from './components/FeaturedPropertiesSection'
import { PropertiesByLocationSection } from './components/PropertiesByLocationSection'
import { PropertyForYouSection } from './components/PropertyForYouSection'
import { RealEstateNewsSection } from './components/RealEstateNewsSection'

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero section for the homepage, showcasing a large banner image and a call-to-action button */}
      <HeroSection />

      {/* Featured news section, highlighting the latest and most important news in the real estate market */}
      <FeaturedNewsSection />

      {/* Featured properties section, showcasing a selection of properties that are currently available for sale or rent */}
      <PropertyForYouSection />

      {/* Properties by location section, allowing users to browse properties based on their preferred locations */}
      <FeaturedPropertiesSection />

      {/* Real estate news section, providing users with the latest updates and insights on the real estate market */}
      <PropertiesByLocationSection />

      {/* Real estate news section, providing users with the latest updates and insights on the real estate market */}
      <RealEstateNewsSection />
    </div>
  )
}
