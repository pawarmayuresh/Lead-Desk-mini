import { PublicLayout } from '../../layouts/PublicLayout'
import { HeroSection } from '../../components/common/HeroSection'
import { ServicesSection } from '../../components/common/ServicesSection'
import { LeadForm } from '../../components/forms/LeadForm'

export const HomePage = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <ServicesSection />
      <LeadForm />
    </PublicLayout>
  )
}
