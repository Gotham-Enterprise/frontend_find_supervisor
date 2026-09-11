import { BrowseTeasers } from '@/components/LandingPage/browse-teasers'
import { CtaBanner } from '@/components/LandingPage/cta-banner'
import { FaqSection } from '@/components/LandingPage/faq-section'
import { HeroSection } from '@/components/LandingPage/hero-section'
import { HowItWorks } from '@/components/LandingPage/how-it-works'
import { KeyFeatures } from '@/components/LandingPage/key-features'
import { ScrollToHash } from '@/components/LandingPage/ScrollToHash'
import { WhySupervisionMatters } from '@/components/LandingPage/why-supervision-matters'

export function HomePage() {
  return (
    <>
      <ScrollToHash />
      <HeroSection />
      <BrowseTeasers />
      <WhySupervisionMatters />
      <HowItWorks />
      <KeyFeatures />
      <CtaBanner />
      <FaqSection />
    </>
  )
}
