import type { AppProps } from 'next/app';
import Script from 'next/script';
import '../styles/globals.css';

// Define the environment variables we expect
const envVars = {
  NEXT_PUBLIC_WHATSAPP_TOKEN: process.env.NEXT_PUBLIC_WHATSAPP_TOKEN || '',
  NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '',
  NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
};

// Type declaration for window.ENV
declare global {
  interface Window {
    ENV: typeof envVars;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  // Inject environment variables into window.ENV
  const envScript = `
    window.ENV = ${JSON.stringify(envVars)};
  `;

  return (
    <>
      <Script
        id="environment-variables"
        dangerouslySetInnerHTML={{ __html: envScript }}
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 