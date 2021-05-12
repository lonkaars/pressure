import Head from 'next/head';

import '../styles/colors.css';
import '../styles/globals.css';
import '../styles/keyframes.css';
import '../styles/paper.css';
import '../styles/presentation.css';
import '../styles/util.css';

export default function Blog({ Component, pageProps }) {
	return <>
		<Head>
			<title>pressure</title>
			<link as='style' href='/font/font.css' />
		</Head>
		<Component {...pageProps} />
	</>;
}
