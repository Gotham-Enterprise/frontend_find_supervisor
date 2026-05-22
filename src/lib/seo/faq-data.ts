import type { FaqItem } from './jsonld'

// ---------------------------------------------------------------------------
// State-level FAQ
// ---------------------------------------------------------------------------

export function getStateFaqs(stateName: string): FaqItem[] {
  return [
    {
      question: `How do I find a clinical supervisor in ${stateName}?`,
      answer: `You can search for licensed clinical supervisors in ${stateName} on Find A Supervisor. Filter by license type, specialty, supervision format (in-person or virtual), and availability to find the best match for your needs.`,
    },
    {
      question: `Can I work with a supervisor licensed in another state?`,
      answer: `Supervision requirements vary by state licensing board. Many supervisors offer virtual supervision and may hold licenses in multiple states. Always confirm with your state board whether out-of-state supervision hours are accepted before starting.`,
    },
    {
      question: `What should I look for when choosing a supervisor in ${stateName}?`,
      answer: `Look for supervisors who hold the same or a related license to the one you are pursuing, have experience in your specialty or population, offer a compatible supervision format, and have a clear fee structure. Reviews from past supervisees can also help you make an informed decision.`,
    },
    {
      question: `How much does clinical supervision cost in ${stateName}?`,
      answer: `Supervision fees vary widely by supervisor, specialty, and format. Many supervisors on Find A Supervisor list their rates on their profiles. You can filter your search to find supervisors within your budget.`,
    },
    {
      question: `What supervision formats are available in ${stateName}?`,
      answer: `Supervisors in ${stateName} offer individual, group, or peer supervision, and many provide virtual sessions as well as in-person meetings. Use the supervision format filter to narrow your search.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// License-type + state FAQ
// ---------------------------------------------------------------------------

export function getLicenseFaqs(licenseLabel: string, stateName: string): FaqItem[] {
  return [
    {
      question: `How do I find a ${licenseLabel} supervisor in ${stateName}?`,
      answer: `On Find A Supervisor, you can filter by license type and state to find ${licenseLabel} supervisors in ${stateName}. Review their profiles for experience, specialty, format, and fees before reaching out.`,
    },
    {
      question: `What are the supervision requirements for ${licenseLabel} in ${stateName}?`,
      answer: `${licenseLabel} supervision requirements vary by state. The ${stateName} licensing board defines the required number of supervised hours, the qualifications supervisors must hold, and how hours are documented. Check with your state board for the most current rules.`,
    },
    {
      question: `Do supervision requirements vary by state for ${licenseLabel}?`,
      answer: `Yes. Each state sets its own requirements for hours, supervisor qualifications, and documentation. If you are working toward licensure in ${stateName}, always verify requirements directly with the ${stateName} licensing board.`,
    },
    {
      question: `What should I ask a ${licenseLabel} supervisor before starting?`,
      answer: `Ask about their supervisory approach, the structure of sessions, their experience supervising for ${licenseLabel} licensure, how they handle documentation, their fee and cancellation policies, and how they communicate between sessions.`,
    },
    {
      question: `Can I count virtual supervision hours for ${licenseLabel} in ${stateName}?`,
      answer: `Many states accept virtual supervision hours for ${licenseLabel}, but policies differ. Confirm whether your state board allows remote supervision hours and under what conditions before starting virtual sessions.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Generic supervisor profile FAQ (used on individual profile pages)
// ---------------------------------------------------------------------------

export function getSupervisorProfileFaqs(supervisorName: string): FaqItem[] {
  return [
    {
      question: `How do I start supervision with ${supervisorName}?`,
      answer: `You can contact ${supervisorName} directly through their Find A Supervisor profile. Send a message or use the hire request feature to express your interest and schedule a consultation.`,
    },
    {
      question: `What information should I bring to a first supervision consultation?`,
      answer: `Bring your current licensure status, the license you are working toward, a summary of your clinical experience, your supervision goals, and any questions about the supervisor's approach, fees, and availability.`,
    },
    {
      question: `How are supervision hours documented?`,
      answer: `Supervisors typically provide signed documentation of hours as required by your state licensing board. Confirm with your supervisor how and when hours are logged and what forms they use.`,
    },
  ]
}
