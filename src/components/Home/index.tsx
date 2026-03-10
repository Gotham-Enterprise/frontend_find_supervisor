import { HeroSection } from '@/components/LandingPage/hero-section'
import { WhySupervisionMatters } from '@/components/LandingPage/why-supervision-matters'
import { HowItWorks } from '@/components/LandingPage/how-it-works'
import { KeyFeatures } from '@/components/LandingPage/key-features'
import { CtaBanner } from '@/components/LandingPage/cta-banner'
import { FaqSection } from '@/components/LandingPage/faq-section'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <WhySupervisionMatters />
      <HowItWorks />
      <KeyFeatures />
      <CtaBanner />
      <FaqSection />
    </>
  )
}
