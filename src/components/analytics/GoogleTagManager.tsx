import { GTM_ID } from '@/lib/analytics/gtm'

/**
 * Standard GTM snippets, split in two because Google wants the loader as high
 * in <head> as possible and the noscript iframe right after <body> opens.
 * Both render nothing when GTM is disabled for this environment.
 *
 * Plain <script> tags rather than next/script, matching the job finder site:
 * the loader must run before hydration so events pushed by early client code
 * are picked up, and inline scripts in a server-rendered <head> are the
 * simplest way to guarantee that.
 */
export function GoogleTagManagerHead() {
  if (!GTM_ID) return null
  return (
    // eslint-disable-next-line @next/next/next-script-for-ga -- deliberate: see component docblock
    <script
      id="gtm-loader"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  )
}

export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
