import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css'; // Include global styles if you have them

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="" href="" />
        <title></title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
