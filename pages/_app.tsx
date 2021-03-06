import Head from 'next/head';

import '../components/play-skip_60fps.css';
import '../styles/colors.css';
import '../styles/dialog.css';
import '../styles/editor.css';
import '../styles/globals.css';
import '../styles/keybindselector.css';
import '../styles/keyframes.css';
import '../styles/mobile.css';
import '../styles/paper.css';
import '../styles/presentation.css';
import '../styles/selection.css';
import '../styles/util.css';

export default function Pressure({ Component, pageProps }) {
	return <>
		<Head>
			<title>pressure</title>
			<link as='style' href='/font/font.css' />
		</Head>
		<Component {...pageProps} />
	</>;
}
