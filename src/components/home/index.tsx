import { HeroSection } from '@/components/landing-page/hero-section'
import { WhySupervisionMatters } from '@/components/landing-page/why-supervision-matters'
import { HowItWorks } from '@/components/landing-page/how-it-works'
import { KeyFeatures } from '@/components/landing-page/key-features'
import { CtaBanner } from '@/components/landing-page/cta-banner'
import { FaqSection } from '@/components/landing-page/faq-section'

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
