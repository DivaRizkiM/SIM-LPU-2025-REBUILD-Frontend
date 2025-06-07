import { NextRequest, NextResponse } from 'next/server'
 
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
//   const cspHeader = `
//     script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com ${process.env.NODE_ENV === 'production' ? '' : `'unsafe-eval'`};
//     frame-src 'self' 'nonce-${nonce}' https://www.google.com;
//     connect-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com ${process.env.NEXT_PUBLIC_BACKEND_URL_BASE};
//     form-action 'self';
//     frame-ancestors 'self';
// `
// default-src 'self' https:;
// style-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' ; (replace this to csp header later on)

  // Replace newline characters and spaces
  // const contentSecurityPolicyHeaderValue = cspHeader
  //   .replace(/\s{2,}/g, ' ')
  //   .trim()
 
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
 
  // requestHeaders.set(
  //   'Content-Security-Policy',
  //   contentSecurityPolicyHeaderValue
  // )
 
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  // response.headers.set(
  //   'Content-Security-Policy',
  //   contentSecurityPolicyHeaderValue
  // )
 
  return response
}