import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PolicySection {
  title: string
  content: React.ReactNode
}

// ─── Content ──────────────────────────────────────────────────────────────────

// TODO: Replace "Gotham Enterprises Ltd" / "gothamenterprisesltd.com" with the correct brand name.
// TODO: Replace contact email (contact@gothamenterprisesltd.com, support@gothamenterprisesltd.com) with the correct address.
// TODO: Update SMS consent links to point to this site's /terms-of-service route.
// TODO: Confirm governing law state (currently "Wisconsin" / "Indiana") is correct for this entity.

const sections: PolicySection[] = [
  {
    title: 'Use of Content on the Site',
    content: (
      <>
        <p>
          You may view, download and print contents from the Site subject to the following
          conditions:
        </p>
        <ul className="list-decimal list-inside space-y-2 pl-4">
          <li>
            The content must be used solely for the purpose of finding employment or finding a
            candidate to fill an employment opportunity or to provide professional or professional
            networking information to the other users of the web site.
          </li>
          <li>The content cannot be modified or altered in any way.</li>
          <li>
            The content cannot be republished, distributed or used in any manner other than what is
            explicitly permitted herein.
          </li>
          <li>
            You are not allowed to use any logo, trademark, image or video piece taken from this
            website without express written permission from us.
          </li>
          <li>Any unauthorized use terminates your right to utilize this site.</li>
          <li>Any unauthorized use may result in an assessment of damages.</li>
          <li>
            You may post positions and CVs on this site but are not allowed to submit any content
            that is obscene, illegal, threatening or defamatory and you are not allowed to invade
            the privacy of a third party with any information taken from this site.
          </li>
          <li>
            You are not allowed to use a false e-mail address or impersonate any person or entity,
            or provide any information that is misleading. Such action will result in removal from
            the web site.
          </li>
          <li>
            By submitting information you represent that the content is accurate, current, reliable,
            complete and error-free.
          </li>
          <li>
            You agree that we may terminate without refund a users ability to post on this site
            should it be determined that the user has violated this agreement.
          </li>
          <li>
            You agree that we may assess damages for any loss of income or actual or implied damages
            that may result from your misuse, abuse or fraudulent behavior on this web site.
          </li>
          <li>
            We do not guarantee that the information posted to this site is true and accurate
            information. Each recruiter, hospital or agency is responsible for conducting its own
            reference and CV investigation to determine the validity of the posters information.
            Each candidate is responsible for gathering its own information regarding a position
            posting prior to entering into any agreement with a recruiter, hospital or other health
            care provider.
          </li>
          <li>
            I consent to receiving informational SMS messages from Gotham Enterprises LTD to the
            mobile phone number provided by me. These messages may include invitations for an
            initial interviews and updates about the status of job applications and openings. I
            understand that I can opt out at any time by replying &quot;STOP&quot; or
            &quot;UNSUBSCRIBE&quot; to unsubscribe, or by contacting customer support at
            support@gothamenterprisesltd.com. By submitting this form I acknowledge and agree that
            Gotham Enterprises LTD will send me the status of my application or any job
            opportunities by SMS. I have also been informed of the Terms of Use of the Gotham
            Enterprises LTD website and I may access the terms of use at:{' '}
            <Link href="/terms-of-service" className="text-primary underline underline-offset-4">
              https://find-supervisor.gothamenterprisesltd.com/terms-of-service
            </Link>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'Trademark and Copyright information',
    content: (
      <p>
        We respect the intellectual property of others. Please respect ours. The Site and contents
        within the Site are the property of Gotham Enterprises Ltd and is protected by the United
        States Copyright laws. The compilation, organization and display of this Site are the
        exclusive property of Gotham Enterprises Ltd. We reserve all rights to this Site and its
        content even if it is not specifically granted in any agreements with Us or in the Terms of
        Use. Gotham Enterprises Ltd designs that are marked indicate that they are registered
        trademarks. Other designs, marks, graphics, logos, page headers, button icons, scripts noted
        on the Site are the sole and exclusive property of this Site and are not able to be used in
        any manner that may cause confusion with customers, in any manner that disparages or
        discredits this site or our Company and in connection with any service that is not
        sponsored, endorsed or produced by this site or our Company. All other trademarks that are
        not owned by this site but that appear on this site are the property of their respective
        owners.
      </p>
    ),
  },
  {
    title: 'Non-Solicitation',
    content: (
      <p>
        No user may use the information posted onto this site to solicit others to use or invest in
        competing products, services or companies. Such activity is a violation of this Agreement
        and such user/s will be terminated and monetary damages may be accessed for any unlicensed
        and/or unauthorized use.
      </p>
    ),
  },
  {
    title: 'Privacy Policy',
    content: (
      <p>
        We respect your right to privacy and for that reason we have developed a privacy policy.
        Please view that policy on this site on a regular basis so that you are aware of our
        protections and practices. The privacy policy and its terms are on this site under the icon,
        &quot;Privacy Policy&quot;. The Privacy Policy is incorporated and made a part of this
        agreement.{' '}
        <Link href="/privacy-policy" className="text-primary underline underline-offset-4">
          Click here to view Privacy Policy
        </Link>
      </p>
    ),
  },
  {
    title: 'Disclaimer - Abuse Prevention Policy',
    content: (
      <>
        <p>
          gothamenterprisesltd.com has the ability to research, track and monitor all user
          activities and interactions on the gothamenterprisesltd.com web site in order to promote a
          secure online environment. gothamenterprisesltd.com attempts to provide Job Seekers
          protection against online scammers through education on scams and proactive investigation.
          gothamenterprisesltd.com reserves the right to review and verify company job postings, job
          seeker registrations, emails sent by company employees and administrators as well as
          emails sent by registered job seekers. gothamenterprisesltd.com enforces the website Terms
          and Conditions and will take all necessary action required to prevent abuse of the
          gothamenterprisesltd.com system.
        </p>
        <p>
          Any company, employee or job seeker found to be violating the Terms and Conditions of the
          gothamenterprisesltd.com website or to be found by the company to be engaged in fraudulent
          or inappropriate use will be terminated from the website and monetary damages may be
          assessed by the company for reinstatement or as appropriate compensation depending on the
          found misuse. gothamenterprisesltd.com reserves the right to file civil suits for damages
          if the situation warrants. gothamenterprisesltd.com will respond to a court order or
          subpoena request for records and/or information regarding any individual or company use of
          the web site.
        </p>
        <p>
          In the event that you have any concerns regarding fraudulent or inappropriate use of the
          gothamenterprisesltd.com site, please contact us at contact@gothamenterprisesltd.com.
        </p>
      </>
    ),
  },
  {
    title: 'Terms of Use for Blog and Resource Section',
    content: (
      <p>
        To assist with professional development and professional associations, Gotham Enterprises
        Ltd provides a professional development article, blog and posting system. All Users, will
        have access to the blog and resource section of the website and therefore need to accept
        responsibility for any postings and comments that an individual or company posts on that
        section. You agree to the Terms of Use for Blog and Resource Section of the site by
        accepting this General Terms and Use and by your one time or repeated use of this website.
        Click here to view the Blog and Resource Section Terms of Use.
      </p>
    ),
  },
  {
    title: 'License to Use by Users who are Job Seekers',
    content: (
      <>
        <p>
          Gotham Enterprises Ltd hereby grants you a nonexclusive, limited, terminable right to
          access and use the Sites only for your personal use to pursue employment opportunities.
          This license authorizes you to view and make one personal copy of any postings for jobs in
          your job type and preference. You agree that you are the only person responsible for
          posting to this site and any consequences as a result of such posting is your sole
          responsibility. Gotham Enterprises Ltd reserves the right to suspend or terminate your
          site usage for any reason, at any time and in its sole discretion.
        </p>
        <p>
          I consent to receiving informational SMS messages from Gotham Enterprises LTD to the
          mobile phone number provided by me. These messages may include invitations for an initial
          interviews and updates about the status of job applications and openings. I understand
          that I can opt out at any time by replying &quot;STOP&quot; or &quot;UNSUBSCRIBE&quot; to
          unsubscribe, or by contacting customer support at support@gothamenterprisesltd.com. By
          submitting this form I acknowledge and agree that Gotham Enterprises LTD will send me the
          status of my application or any job opportunities by SMS. I have also been informed of the
          Terms of Use of the Gotham Enterprises LTD website and I may access the terms of use at:{' '}
          <Link href="/terms-of-service" className="text-primary underline underline-offset-4">
            https://find-supervisor.gothamenterprisesltd.com/terms-of-service
          </Link>
        </p>
      </>
    ),
  },
  {
    title: 'License to Use by Users who are Employers or Recruiters',
    content: (
      <>
        <p>
          Gotham Enterprises Ltd hereby grants you a nonexclusive, limited, terminable, right to
          access and post on the sites for your professional purpose of obtaining employees directly
          for your company or a company that you directly represent. As a recruiter, your company
          must have a contract directly with a healthcare employer to post their job/s for the sole
          purpose of sourcing and placing candidates directly with such employer per the terms of
          the contract. Compensation from employers to recruiters must be associated with hires that
          have resulted from that direct job seeker presentation. Marketing companies or Media
          companies do not qualify as recruiting agencies for this purpose. Companies that provide
          an upsell marketing opportunity for a flat fee to employers do not qualify as recruiters
          for this purpose and are not qualified users of this site. This authorizes employers and
          recruiters to view and download a single copy of a job seekers material for the sole
          purpose of possible employment and job prospects. You may not sell, transfer or assign any
          of the Service of your rights to any of the Services provided by Gotham Enterprises Ltd to
          any third party without the express written authority of Gotham Enterprises Ltd. You may
          also not use your license for any other company or affiliate that your company has
          acquired, initiated or merged into your existing company without the express written
          authority of Gotham Enterprises Ltd. You agree that you are solely responsible for any
          material that you post or upload to the site and any consequences arising from such
          posting.
        </p>
        <p>
          I consent to receiving informational SMS messages from Gotham Enterprises LTD to the
          mobile phone number provided by me. These messages may include invitations for an initial
          interviews and updates about the status of job applications and openings. I understand
          that I can opt out at any time by replying &quot;STOP&quot; or &quot;UNSUBSCRIBE&quot; to
          unsubscribe, or by contacting customer support at support@gothamenterprisesltd.com. By
          submitting this form I acknowledge and agree that Gotham Enterprises LTD will send me the
          status of my application or any job opportunities by SMS. I have also been informed of the
          Terms of Use of the Gotham Enterprises LTD website and I may access the terms of use at:{' '}
          <Link href="/terms-of-service" className="text-primary underline underline-offset-4">
            https://find-supervisor.gothamenterprisesltd.com/terms-of-service
          </Link>{' '}
          The SMS consent will inclusively pertains to company&apos;s name purpose and will not be
          involved to any marketing purposes.
        </p>
        <p>
          Recruiters and Employers shall not engage in Applicant Harvesting which is the process of
          obtaining information (personal, employment or otherwise) about a job seeker by using
          false, fictitious, misleading or alluring job postings to unfairly entice a job seeker to
          divulge personal, employment or other information that he or she would not divulge if the
          intent of such a job posting were known by the job seeker.
        </p>
        <p>
          You may not respond to postings by other users in any manner or for any purpose other than
          that which is expected (i.e., to apply for the job or to initiate further discussion with
          the candidate). Communications soliciting the employer&apos;s business are prohibited.
        </p>
        <p>
          Gotham Enterprises Ltd reserves the right to terminate your license at any time in the
          event that it determines that you are in breach of these Terms and Conditions. Gotham
          Enterprises Ltd reserves the right to assess monetary damages for any unauthorized and
          unlicensed use.
        </p>
        <p>
          Users are prohibited from violating or attempting to violate the security of the website,
          including, without limitation:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            accessing data not intended for such user or logging into a server or account which the
            user is not authorized to access;
          </li>
          <li>
            attempting to probe, scan or test the vulnerability of a system or network or to breach
            security or authentication measures without proper authorization;
          </li>
          <li>
            attempting to interfere with service to any user, host or network, including, without
            limitation, via means of submitting a virus to the Site, or other acts such as
            &quot;overloading&quot; or &quot;flooding&quot;;
          </li>
          <li>
            sending unsolicited e-mail, including promotions and/or advertising of products or
            services;
          </li>
        </ul>
        <p>
          Violation of these Security Rules may result in civil or criminal liability. The
          administration will investigate occurrences which may involve such violations and may
          involve, and cooperate with, law enforcement authorities in prosecuting users who are
          involved in such violations.
        </p>
      </>
    ),
  },
  {
    title: 'Materials',
    content: (
      <>
        <p>
          As an Employer/Recruiter you represent, warrant and agree that all materials provided by
          you for use in connections with any job postings or company postings will not violate any
          laws or regulations. You warrant and agree that those materials will not violate any other
          person or companies copyright, trademark or incite any public or private action. You
          hereby grant Gotham Enterprises Ltd a non-exclusive, royalty free license to any posted
          materials and to hyper link to such materials while you are a member of the site in good
          standing.
        </p>
        <p>
          It is agreed that the Database is an asset. Database access is for the purpose of finding
          candidates that fill your current directly contracted job openings. Removing data from
          this database and using it for another purpose is in violation of this policy and you
          agree is an act of conversion. Conversion and continued use or sale of that information is
          a direct violation of this agreement and shall result in removal from the site and an
          assessment of monetary damages and if needed injunctive relief.
        </p>
      </>
    ),
  },
  {
    title: 'License to Use by Users who are Resource Writers, Posters and Commenters',
    content: (
      <>
        <p>
          Gotham Enterprises Ltd hereby grants you a nonexclusive, limited, terminable, right to
          access and post on the sites for your professional purpose or the professional development
          of others as well as comments and personal and professional opinions. You may not sell,
          transfer or assign any of the Service or your rights to any of the Services provided by to
          any third party without the express written authority of Gotham Enterprises Ltd. You may
          also not use your license for any other company or affiliate that your company has
          acquired, initiated or merged into your existing company without the express written
          authority of Gotham Enterprises Ltd. You agree that you are solely responsible for any
          material that you post or upload to the site and any consequences arising from such
          posting. Reserves the right to terminate your license at any time in the event that it
          determines that you are in breach of these Terms and Conditions. Gotham Enterprises Ltd
          reserves the right to assess monetary damages for any unauthorized and unlicensed use. All
          License users in this section must agree and comply with the Resource Terms and
          Conditions. Click here to view Resource Terms and Conditions.
        </p>
        <p>
          Banner and Third Party Sites: Our site has banners and links to third party web sites. We
          do not control, endorse or guarantee any content found on any site that is not owned and
          operated exclusively by Us. You further agree that this site/company will not be liable
          for any loss or damage of any sort associated with your use of third party sites or their
          content.
        </p>
      </>
    ),
  },
  {
    title: 'Site Security',
    content: (
      <p>
        We reserve the right to view, monitor and record any and all activity that occurs on the
        Site. This is done in order to preserve the integrity of the site and protect the users of
        the Site. Any actual or attempted unauthorized use of the site can result in removal from
        the site, damages, civil suits and/or criminal prosecution. We will release any information
        requested through a court order or subpoena regarding investigations and/or prosecutions.
      </p>
    ),
  },
  {
    title: 'Services',
    content: (
      <p>
        We reserve the right to change and/or discontinue any or all of its services at any time and
        for any reason. We also reserve the right to deny you access to the Site. You agree that you
        are over the age of 18 or the age of majority.
      </p>
    ),
  },
  {
    title: 'Termination of Services',
    content: (
      <p>
        This Site receives payment via credit card. In the event that you wish to cancel a service,
        written notice to us of such cancellation needs to be provided at least 3 business days
        prior to the renewal date, or credit card charge date, to avoid the next monthly charge. Any
        refunds issued will include a $20 service charge.
      </p>
    ),
  },
  {
    title: 'Partner Corporation',
    content: (
      <p>
        We have the right to partner with other public and private corporations. A partner
        corporation may contact you to obtain additional information regarding your opportunity
        search and to provide you with assistance in your search. A partner corporation is required
        to comply with our privacy policy and is restricted from selling or distributing your
        information without your consent.
      </p>
    ),
  },
  {
    title: 'Indemnity',
    content: (
      <p>
        You agree to defend, indemnify and hold harmless this Site/Company, its&apos; employees,
        stockholders, attorneys, agents and contractors against all claims, expenses, liabilities,
        losses, costs and damages, including reasonable attorney&apos;s fees, that the above stated
        agents, attorneys, employees, stockholders, contractors or entity may incur in connection
        with your use of the Site, any link or banner associated with the Site or any content you
        supply to or remove from the site.
      </p>
    ),
  },
  {
    title: 'Limits of Liability',
    content: (
      <p>
        This site/Company is not liable for any loss resulting from, but not limited to, failure of
        electronic or mechanical equipment, communication lines, telephone lines, other internet
        technology failure, database failure, computer viruses, unauthorized access, theft, natural
        disasters or federal regulation restrictions. We do not guarantee that the information
        provided or posted is free of technical, typographical or material content errors.
      </p>
    ),
  },
  {
    title: 'Responsibility',
    content: (
      <p>
        Gotham Enterprises Ltd assumes no responsibility for documents, articles or materials posted
        by Users or their actions and representations on the site. Gotham Enterprises Ltd acts as a
        portal for employment opportunities and professional information and does not accept
        responsibility for the contents or representation of posters or users. Gotham Enterprises
        Ltd will in good faith investigate and attempt to resolve any reported misuse or abuse of
        the site reported by any User.
      </p>
    ),
  },
  {
    title: 'Applicable Law',
    content: (
      <p>
        All matters relating to your access to and use of the Site shall be governed by U.S. Federal
        law or the laws of the State of Wisconsin where the home office of this company is located.
        By agreeing to this Terms of Use Agreement, you agree to the exclusive personal jurisdiction
        and to the exclusive venue of the state courts of Indiana. In the event that the subject of
        the litigation is a Federal law question and requires resolution in a Federal forum you
        submit to the federal jurisdiction of the United States District Court for the Central
        District of Wisconsin. The parties shall first attempt to resolve the disputed issue through
        mediation prior to any court filings.
      </p>
    ),
  },
  {
    title: 'Severability - Entire Agreement',
    content: (
      <p>
        If a court rules that any provision of this agreement is unenforceable, the balance of this
        contract shall remain enforceable and the parties will ask the court to modify the
        unenforceable part if possible so that the paragraph and/or terms used becomes enforceable
        to the maximum extent allowable. Failure to enforce any specific provision of this agreement
        does not result in a waiver to enforcement of the remaining provisions.
      </p>
    ),
  },
  {
    title: 'Entire Understanding',
    content: (
      <p>
        This agreement, its restrictions and conditions constitute the entire agreement between this
        site/company and the user in terms of your use to this web site for searching and posting
        purposes. In the event, you subscribe to this site you may be subject to an additional
        agreement that governs among other items, distribution of jobs and information, the payment
        procedure and time periods of such subscription or advertisement. In that situation that
        agreement is an additional agreement that is entered into and the terms of that agreement
        stand and are represented independently from this stated agreement. In the event that there
        are conflicting terms in the two agreements regarding the use of this site, the terms of the
        additional separate agreement shall be controlling.
      </p>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-base font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
