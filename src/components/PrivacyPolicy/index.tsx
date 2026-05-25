import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PolicySection {
  title: string
  content: React.ReactNode
}

// ─── Content ──────────────────────────────────────────────────────────────────

// TODO: Replace "Gotham Enterprises Ltd" with the correct brand name throughout.
// TODO: Replace contact email (support@gothamenterprisesltd.com) with the correct address.
// TODO: Replace physical address (28 Valley Rd, STE#116, Montclair NJ 07042) with the correct address.
// TODO: Update SMS consent links to point to this site's /terms-of-service route.

const sections: PolicySection[] = [
  {
    title: '1. Overview',
    content: (
      <>
        <p>
          We welcome you to Gotham Enterprises Ltd! We want you to be aware of our privacy policy,
          because privacy policies are not all alike.
        </p>
        <p>
          Our company respects your individual privacy. Our privacy policy informs you of how we
          electronically collect and process your information. This policy will inform you of
          options that you have to control or restrict the availability and use of your information.
        </p>
        <p>
          Gotham Enterprises Ltd (Gotham Enterprises Ltd, &quot;us&quot;, &quot;we&quot;, or
          &quot;our&quot;) is a limited liability company registered in the state of Nevada in the
          United States of America with its principal office in Las Vegas, Nevada. We provide users,
          (&quot;user/s&quot;, &quot;you&quot;, &quot;your&quot;) services delivered via Gotham
          Enterprises Ltd website, a mobile application, mobile site and/or any other platform or
          media through which we make our services available. A &quot;user&quot; may be a member, a
          visitor, an affiliate, a partner, company, partner site, poster, writer or any other
          person or company that participates in a Gotham Enterprises Ltd service.
        </p>
      </>
    ),
  },
  {
    title: '2. Consent',
    content: (
      <>
        <p>
          Each time you use this site or provide us with information you represent that you agree to
          the terms of this policy. When you submit data to this site, you consent to the
          collection, use and disclosure of that information in accordance with the terms of this
          policy as outlined and discussed below.
        </p>
        <p>
          Please review this Privacy Policy periodically as we may update it. You agree that by
          using these sites you are expressly and affirmatively consenting to our use and disclosure
          of the information that you provide, and consenting to receive emails, as described
          herein.
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
    title: '3. Terms',
    content: (
      <p>
        Important terms in this policy are, &quot;personally identifying information&quot;,
        &quot;non-identifying information&quot; and &quot;server data&quot;. This Privacy Policy
        incorporates by reference the Terms and Conditions for the sites which apply to this privacy
        policy.
      </p>
    ),
  },
  {
    title: '4. How we get to know our customers',
    content: (
      <>
        <p>
          We are in the business of putting people in touch with other people. That requires more
          than innovative technical services. It requires that we understand you and your needs. We
          get to know you primarily through information that you provide to us when registering and
          using our site. The information that you provide ranges from basic contact information to
          payment information, to technical IP file information. When you register with our site you
          agree to provide and maintain accurate, complete and updated information. You further
          agree to our use of your information consistent with this Privacy Policy and the laws of
          the United States.
        </p>
        <p>
          For operational and quality assurance purposes, we keep track of site traffic patterns and
          maintain log files of user access to site files. The information that we receive from or
          about you is stored on a system that is designed to prevent loss, misuse, unauthorized
          access, disclosure, alteration or destruction of that information. We also use an outside
          provider that encrypts your sensitive information such as credit card numbers to ensure
          your privacy. We collect information to better understand our market and to better serve
          you.
        </p>
        <p>
          We use the above collected information to monitor and improve our internal operations. We
          also use it to ensure that we bill you correctly, administer your account accurately and
          that we properly perform the services of this site. We use the collected information to
          improve the users experience with the site. The data helps us to determine how much our
          customers use certain parts of the site, allowing us to enhance those parts to fit the
          needs of the users. You agree the Gotham Enterprises Ltd can use your provided information
          to contact you and to deliver information to you that is targeted to your interests or for
          administrative or partner driven purposes. By accepting this Privacy Policy, you expressly
          agree to receive information from our sites and partners. If you do not wish to receive
          this information you may opt out of any further promotional or job related emails but will
          remain on the list for administrative purposes. Gotham Enterprises Ltd may also use non
          identifiable information about its users to prepare demographic analysis and reports.
        </p>
      </>
    ),
  },
  {
    title: '5. Personally Identifiable Information',
    content: (
      <>
        <p>
          When you register with us your name, address, etc. is recorded in our database. This
          information is not for sale or use by anyone except our company and its network of job
          board sites, our partner corporations and our subcontractors. We do contract with other
          companies to assist us in our abilities to better serve you. Those companies will have
          access to our database files and must comply with our strict privacy policy.
        </p>
        <p>
          You may change, update or delete all of your personal information from this site at any
          time. Information that you have posted may have been recorded by users and then becomes
          their property. This may result in unsolicited messages from those third parties for which
          Gotham Enterprises Ltd is not liable. In certain circumstances, you may have clicked
          through to the Gotham Enterprises Ltd site through another website, in the event that you
          provided any information to that linked website prior to arriving onto the Gotham
          Enterprises Ltd site, we are not liable for the use of that information. Wherever you
          reside or from whichever country you are using the services and/or submit information, you
          consent to our use of your information consistent with this Privacy Policy, in the United
          States.
        </p>
        <p>
          We can make no claim or take any responsibility as to how your posted information is
          utilized by those that take it from the posting portion of this site. If you choose to
          post your information to be open to employers or recruiters and to be public on the web
          sites, those employers or recruiters users may access your information and place it in
          their own company data file. Once your information has been removed from the Gotham
          Enterprises Ltd website and placed in an employer or recruiter company file, Gotham
          Enterprises Ltd is not able to access or assist in any removal from those outside company
          files. Gotham Enterprises Ltd is also not responsible for any use or sale of such
          information from that point. Gotham Enterprises Ltd does offer users a privacy setting
          that assures only a limited amount of identifying information can be obtained through the
          Gotham Enterprises Ltd site.
        </p>
      </>
    ),
  },
  {
    title: '6. Registration',
    content: (
      <p>
        In order to post on our site you will be required to complete a registration. This
        registration will request specific personal information about you, your firm, agency or
        hospital group. Contact information is required as a part of this registration. This
        information is used to contact the user of this site about services, changes in services as
        well as for billing needs. Information you provide that you request to be kept confidential
        will not show up on a public profile or posting. An option of confidential may limit your
        ability to post on some areas of the web site.
      </p>
    ),
  },
  {
    title: "7. Posted CV's and / or Positions",
    content: (
      <>
        <p>
          Our subscribers, recruiters and employers view posted CV&apos;s and position postings. You
          may have us disclose as much personal information as you wish. You may want to consider
          what information you wish to be posted depending on whether your job search is common
          knowledge to your colleagues, current employer or staff. That is why this site allows you
          to identify what information you provide that you do not wish to appear in your public
          posting. It is our intention that only paying customers or prospective customers will have
          access to the CV or resume database, but we cannot guarantee that other parties will not
          without our consent gain access to the CV or resume database. Be aware that when you post
          personal information in an uploaded CV or resume, Gotham Enterprises Ltd is not able to
          keep that information confidential. You may have marked your profile as confidential, but
          are providing identifying information through your uploaded CV or resume. We are not
          responsible for the use of any information in an uploaded CV&apos;s, resume or job posting
          taken from this site by a third party. We are also not responsible for the accuracy of any
          information uploaded or posted to the web site by a user. Any inappropriate information
          displayed in a CV or resume will be removed and all privileges of site use will be
          suspended.
        </p>
        <p>
          Our goal is to provide a service that connects candidates with their desired position and
          location. It is also to assist employers and/or recruiters in finding the right candidate.
          We also provide professional information to users of the site to review, comment and
          contribute. Users of this site may copy or retain information to their files that you have
          posted. Although we attempt to hold our users to a high ethical standard, we are not
          responsible for their use of that information.
        </p>
        <p>
          By posting on this site you represent to us that you have obtained consent from any third
          party individuals or business entities to post data regarding their specific job search or
          position posting. By posting information you also state that you have informed any third
          party of how they may access to view the information posted and how to contact you to
          rectify an inappropriate, incorrect or any non-consent to information.
        </p>
        <p>
          No member or agents of this site/company shall be held responsible for the content or
          another member&apos;s posted information.
        </p>
      </>
    ),
  },
  {
    title: '8. Fraudulent Access or Use',
    content: (
      <>
        <p>
          No company or user of this site shall provide another person or company with their
          password or access without our written consent. Any unauthorized access or use is an act
          of fraud and shall result in removal from the site and an assessment of reasonable charges
          for such fraudulent use. Reasonable charges shall be assessed based on each individual
          case. Fraudulent use results in damages and agreement to these terms, reflects your
          agreement to these terms of damages.
        </p>
        <p>
          It is agreed that the Database is an asset. Database access is for the purpose of finding
          candidates that fill your current contracted job openings. Removing data from this
          database and using it for another purpose is in violation of this policy and you agree is
          an act of conversion. Conversion and continued use or sale of that information is a direct
          violation of this agreement and shall result in removal from the site and an assessment of
          monetary damages and if needed injunctive relief.
        </p>
        <p>
          Email and online fraud are ongoing concerns for all internet businesses. If you are the
          recipient of an email that appears to come from Gotham Enterprises Ltd and is a phishing
          email, spam or presents a position that seems too good to be true, please contact us so we
          can follow up on it immediately. If you are asked for your log in information or any other
          personal information, please do not provide it and again, contact us immediately. We will
          take immediate action.
        </p>
      </>
    ),
  },
  {
    title: '9. E-Mail',
    content: (
      <>
        <p>
          All initial correspondence will be through an e-mail message directed from our site. This
          allows recruiters and employers to establish direct contact with you without revealing
          your name or identifying information. Once you have received a request for further
          interest in your CV or posted position through that initial e-mail message, you may choose
          to correspond directly with the individual or group. Responding directly to that initial
          email may result in that recruiter or employer obtaining identifying information directly
          from your response. Gotham Enterprises Ltd is not responsible for any information released
          directly by you in response to correspondence you receive from the web site. If you do not
          blind your CV or apply directly to a position via the site, you are responsible for any
          information provided to that subscriber, recruiter, employer or candidate in any
          correspondence. We do not have any control regarding the information you provide to third
          parties you come into contact from our site.
        </p>
        <p>
          You will also be notified automatically of any job opportunities that match your specialty
          or geographic preferences. You may choose when and if you want to respond to those
          opportunities.
        </p>
      </>
    ),
  },
  {
    title: '10. Linking to other Sites',
    content: (
      <p>
        You may access other sites through advertisements on this website as well as resource links
        provided. Once you leave this site, our privacy policy, as well as the other policies in
        effect on this site, will no longer be in effect. You will become subject to that
        site&apos;s policies. Make sure that you read their policies before proceeding.
      </p>
    ),
  },
  {
    title: '11. Cookies',
    content: (
      <>
        <p>
          Cookies are small text files recorded in a user&apos;s hard drive. Cookies are used by
          many sites to help track user information and to assist with password identification and
          in remembering a user making multiple trips to the Web site. Cookies do not damage user
          files and they cannot provide information from a user&apos;s hard drive. They simply allow
          us to provide a faster service and more personalized visit to our site. Our third party
          advertisers may also utilize cookies when you visit their site. This allows them to
          measure advertising effectiveness. This information is not personally identifiable. Most
          internet browsers allow you to erase cookies from your computer hard drive, block all
          cookies or receive a warning prior to a cookie being stored. Please be aware that failure
          to allow a cookie to be placed on your computer may result in certain features or services
          failing to function properly.
        </p>
        <p>
          We may use third party advertising companies which may place or access cookies on your
          computer. This information is used to provide information about goods and services of
          interest to you or to tailor demographic or preference information so we can better serve
          you.
        </p>
      </>
    ),
  },
  {
    title: '12. Security',
    content: (
      <p>
        This Site uses a variety of programs to protect user&apos;s information. Information such as
        credit card numbers are encrypted and protected using one of the best encryption programs on
        the Internet. Information is backed up on a daily basis.
      </p>
    ),
  },
  {
    title: '13. Notification of Changes',
    content: (
      <p>
        Please check back to this privacy policy on a regular basis. We reserve the right to change
        or modify this policy at any time. In the event that we change our policy, we will post a
        notification of change on the home page for thirty (30) days. In the event that you do not
        log into this site during that thirty (30) day period it is the users&apos; responsibility
        to check the policy page for updated policy. You may opt out of any changes in the policy by
        notifying us with an e-mail to our contact e-mail address. In the event that you do wish to
        opt out, the previous privacy policy in effect at the time that you made payment will be in
        effect for the remainder of the period that has been prepaid. The user at that time can
        determine whether they wish to discontinue their use of this site&apos;s services or if they
        wish to continue using the site under the changed policy provisions.
      </p>
    ),
  },
  {
    title: '14. Employee Accountability',
    content: (
      <p>
        Please check back to this privacy policy on a regular basis. We reserve the right to change
        or modify this policy at any time. In the event that we change our policy, we will post a
        notification of change on the home page for thirty (30) days. In the event that you do not
        log into this site during that thirty (30) day period it is the users&apos; responsibility
        to check the policy page for updated policy. You may opt out of any changes in the policy by
        notifying us with an e-mail to our contact e-mail address. In the event that you do wish to
        opt out, the previous privacy policy in effect at the time that you made payment will be in
        effect for the remainder of the period that has been prepaid. The user at that time can
        determine whether they wish to discontinue their use of this site&apos;s services or if they
        wish to continue using the site under the changed policy provisions.
      </p>
    ),
  },
  {
    title: '15. U.S.-EU Safe Harbor Framework and the U.S. Swiss Safe Harbor Framework',
    content: (
      <>
        <p>
          Gotham Enterprises Ltd complies with the U.S.-EU Safe Harbor Framework and the U.S. Swiss
          Safe Harbor Framework as set forth by the U.S. Department of commerce regarding the
          collection, use and retention of personal information from European Union member countries
          and Switzerland. Gotham Enterprises Ltd has certified that it adheres to the Safe Harbor
          Privacy Principles of notice, choice, onward transfer, security, data integrity, access
          and enforcement. Information is located at http://www.export.gov/safeharbor/. Please feel
          free to contact us with any questions.
        </p>
        <p>
          Compliance with the US-EU and US-Swiss Safe Harbor Principles, we will resolve complaints
          about your privacy and our collection and use of your personal information. Any concerns
          or complaints please contact us. Unresolved privacy issues under the U.S. EU and US-Swiss
          Safe Harbor Principles will be referred for independent dispute resolution.
        </p>
        <p>
          Gotham Enterprises Ltd cannot ensure that all of your private communications and other
          personal information will never be disclosed as described in this Privacy Policy. We are
          committed to protecting your privacy but in some circumstances we are not able to control
          the actions of others that may result in your information becoming public. As a user of
          this site, you understand and agree that you are assuming responsibility and risk
          associated with the placement of personally identifiable information on this web site
          either directly or by uploading documents to this web site, direct use and actions and
          conduct on and off of this site.
        </p>
      </>
    ),
  },
  {
    title: "16. Do Not Do's",
    content: (
      <>
        <p>
          This is a list of things that this site does not do. It is by no means a comprehensive
          listing but is one that is created to ensure your private information remains private
          unless you decide otherwise:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>We do not sell names of job seekers.</li>
          <li>We do not post personal information that is requested to be kept confidential.</li>
          <li>
            We will not identify a job seeker to a recruiter or employer without your prior
            approval.
          </li>
          <li>We enforce a zero Spam policy.</li>
          <li>
            We do not intentionally or knowingly collect information from children under the age of
            18 that visit this site.
          </li>
          <li>Please do not give your social security number to anyone that contacts you.</li>
          <li>
            Never give out a credit card or bank account number to a prospective employer/recruiter.
          </li>
          <li>Be careful what personal information you provide to people that you do not know.</li>
        </ul>
      </>
    ),
  },
  {
    title: '17. Responsibility',
    content: <p>The user accepts all risks and responsibility.</p>,
  },
  {
    title: '18. Contact Us',
    content: (
      <>
        <p>
          In the event that you have any questions please feel free to contact us at
          support@gothamenterprisesltd.com, or by letter at Gotham Enterprises Ltd, 28 Valley Rd,
          STE#116, Montclair, NJ 07042. Please include your name and address in all correspondence.
        </p>
      </>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
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
