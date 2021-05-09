import Head from 'next/head';

import '../styles/globals.css';
import '../styles/colors.css';

export default function Blog({ Component, pageProps }) {
	return <>
		<Head>
			<title>pressure</title>
			<link as='style' href='/font/font.css' />
		</Head>
		<Component {...pageProps} />
	</>;
}
