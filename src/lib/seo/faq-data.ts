import type { FaqItem } from './jsonld'

// ---------------------------------------------------------------------------
// State-level FAQ
// ---------------------------------------------------------------------------

export function getStateFaqs(stateName: string): FaqItem[] {
  return [
    {
      question: `What types of Supervisors can I find in ${stateName}?`,
      answer: `Find A Supervisor connects healthcare professionals with Mental Health Counselor Supervisors, Collaborating Physicians, and Supervising Physicians in ${stateName}. Filter by Supervisor type, specialty, occupation, and supervision format to find the best match for your needs.`,
    },
    {
      question: `How do I find a clinical Supervisor in ${stateName}?`,
      answer: `You can search for licensed clinical Supervisors in ${stateName} on Find A Supervisor. Filter by license type, specialty, supervision format (in-person or virtual), and availability to find the best match for your licensure journey.`,
    },
    {
      question: `Can I find a Collaborating Physician in ${stateName}?`,
      answer: `Yes. Find A Supervisor lists Collaborating Physicians in ${stateName} who work with nurse practitioners and other advanced practice providers. Filter by specialty and format to find a Collaborating Physician who meets your state's requirements.`,
    },
    {
      question: `How do I find a Supervising Physician in ${stateName}?`,
      answer: `You can search for Supervising Physicians in ${stateName} on Find A Supervisor. Filter by specialty and location to connect with physicians who supervise physician assistants in your area.`,
    },
    {
      question: `Can I work with a Supervisor licensed in another state?`,
      answer: `Supervision and collaboration requirements vary by state licensing board. Many Supervisors offer virtual sessions and may hold credentials in multiple states. Always confirm with your state board whether out-of-state supervision or collaboration is accepted before starting.`,
    },
    {
      question: `What supervision formats are available in ${stateName}?`,
      answer: `Supervisors and Collaborating Physicians in ${stateName} offer virtual, in-person, and hybrid formats. Use the supervision format filter to narrow your search to the arrangement that works best for you.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Supervisor-type pSEO FAQs
// ---------------------------------------------------------------------------

export function getSupervisorTypeFaqs(typeSlug: string, stateName: string): FaqItem[] {
  if (typeSlug === 'collaborating-physicians') {
    return [
      {
        question: `How do I find a Collaborating Physician in ${stateName}?`,
        answer: `On Find A Supervisor, filter by Supervisor type and select "Collaborating Physician," then set your state to ${stateName}. You can also filter by specialty and format to narrow your results to physicians who match your practice needs.`,
      },
      {
        question: `What are the collaboration requirements for nurse practitioners in ${stateName}?`,
        answer: `Collaboration requirements for nurse practitioners vary by state. ${stateName}'s licensing board sets the rules around collaboration agreements, including required documentation and the scope of the Collaborating Physician's role. Always verify the current requirements directly with your state board.`,
      },
      {
        question: `Can nurse practitioners in ${stateName} filter by specialty when searching for Collaborating Physicians?`,
        answer: `Yes. Find A Supervisor lets you filter by specialty, location, and supervision format so you can find a Collaborating Physician whose clinical background aligns with your practice area in ${stateName}.`,
      },
      {
        question: `What should I discuss before signing a collaboration agreement?`,
        answer: `Before signing, discuss the scope of collaboration, how often you will consult, the physician's availability for urgent questions, fee structure, documentation expectations, and how the agreement will be renewed or terminated if needed.`,
      },
      {
        question: `Do Collaborating Physician requirements vary by state?`,
        answer: `Yes. Some states require formal collaboration agreements for nurse practitioners; others operate under a full-practice authority model with no collaboration requirement. Verify the current rules with your ${stateName} licensing board before beginning.`,
      },
    ]
  }

  if (typeSlug === 'supervising-physicians') {
    return [
      {
        question: `How do I find a Supervising Physician in ${stateName}?`,
        answer: `On Find A Supervisor, filter by Supervisor type and select "Supervising Physician," then set your state to ${stateName}. Filter by specialty and format to connect with physicians who supervise physician assistants in your practice area.`,
      },
      {
        question: `What are the supervision requirements for physician assistants in ${stateName}?`,
        answer: `PA supervision requirements vary by state. ${stateName}'s licensing board defines the required relationship between PAs and Supervising Physicians, including documentation, on-site presence rules, and the scope of the supervisory agreement. Always check with your state board for current requirements.`,
      },
      {
        question: `Can physician assistants in ${stateName} filter by specialty when searching for Supervising Physicians?`,
        answer: `Yes. Find A Supervisor allows you to filter by specialty, location, and format so you can find a Supervising Physician whose background matches your practice area in ${stateName}.`,
      },
      {
        question: `What should I confirm before working with a Supervising Physician?`,
        answer: `Confirm their availability for consultations, the scope of their supervisory role, required documentation, fee expectations, how emergencies are handled, and any state-specific requirements for supervision agreements in ${stateName}.`,
      },
      {
        question: `Do Supervising Physician requirements vary by state?`,
        answer: `Yes. PA supervision laws differ significantly from state to state. Some states require signed supervision agreements; others have moved toward team-based practice models. Always confirm the current ${stateName} requirements with your licensing board.`,
      },
    ]
  }

  // Default: Mental Health Counselor Supervisors
  return [
    {
      question: `How do I find a Mental Health Counselor Supervisor in ${stateName}?`,
      answer: `On Find A Supervisor, filter by license type and state to find Mental Health Counselor Supervisors in ${stateName}. Review their profiles for experience, specialty, format, and fees before reaching out.`,
    },
    {
      question: `What are the supervision requirements for mental health counselors in ${stateName}?`,
      answer: `Mental health counselor supervision requirements vary by state. The ${stateName} licensing board defines the required number of supervised hours, Supervisor qualifications, and documentation standards. Check with your state board for the most current rules.`,
    },
    {
      question: `Do supervision requirements vary by state for mental health counselors?`,
      answer: `Yes. Each state sets its own requirements for hours, Supervisor qualifications, and documentation. If you are working toward licensure in ${stateName}, always verify requirements directly with the ${stateName} licensing board.`,
    },
    {
      question: `What should I ask a mental health Supervisor before starting?`,
      answer: `Ask about their supervisory approach, session structure, experience with your license type, documentation practices, fee and cancellation policies, and how they communicate between sessions.`,
    },
    {
      question: `Can I count virtual supervision hours for mental health licensure in ${stateName}?`,
      answer: `Many states accept virtual supervision hours, but policies differ. Confirm whether your ${stateName} licensing board allows remote supervision hours and under what conditions before starting virtual sessions.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// License-type + state FAQ
// ---------------------------------------------------------------------------

export function getLicenseFaqs(licenseLabel: string, stateName: string): FaqItem[] {
  return [
    {
      question: `How do I find a ${licenseLabel} Supervisor in ${stateName}?`,
      answer: `On Find A Supervisor, you can filter by license type and state to find ${licenseLabel} Supervisors in ${stateName}. Review their profiles for experience, specialty, format, and fees before reaching out.`,
    },
    {
      question: `What are the supervision requirements for ${licenseLabel} in ${stateName}?`,
      answer: `${licenseLabel} supervision requirements vary by state. The ${stateName} licensing board defines the required number of supervised hours, the qualifications Supervisors must hold, and how hours are documented. Check with your state board for the most current rules.`,
    },
    {
      question: `Do supervision requirements vary by state for ${licenseLabel}?`,
      answer: `Yes. Each state sets its own requirements for hours, Supervisor qualifications, and documentation. If you are working toward licensure in ${stateName}, always verify requirements directly with the ${stateName} licensing board.`,
    },
    {
      question: `What should I ask a ${licenseLabel} Supervisor before starting?`,
      answer: `Ask about their supervisory approach, the structure of sessions, their experience supervising for ${licenseLabel} licensure, how they handle documentation, their fee and cancellation policies, and how they communicate between sessions.`,
    },
    {
      question: `Can I count virtual supervision hours for ${licenseLabel} in ${stateName}?`,
      answer: `Many states accept virtual supervision hours for ${licenseLabel}, but policies differ. Confirm whether your state board allows remote supervision hours and under what conditions before starting virtual sessions.`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Generic Supervisor profile FAQ (used on individual profile pages)
// ---------------------------------------------------------------------------

export function getSupervisorProfileFaqs(supervisorName: string): FaqItem[] {
  return [
    {
      question: `How do I start working with ${supervisorName}?`,
      answer: `You can contact ${supervisorName} directly through their Find A Supervisor profile. Send a message or use the hire request feature to express your interest and schedule a consultation.`,
    },
    {
      question: `What information should I bring to a first consultation?`,
      answer: `Bring your current licensure or credential status, a summary of your professional experience, your supervision or collaboration goals, and any questions about the Supervisor's approach, fees, and availability.`,
    },
    {
      question: `How is supervision or collaboration documented?`,
      answer: `Supervisors and Collaborating Physicians typically provide signed documentation or agreements as required by your state licensing board. Confirm with your Supervisor how and when documentation is completed and what forms they use.`,
    },
  ]
}
