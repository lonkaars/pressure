import Head from 'next/head';

export function NoScroll() {
	return <Head>
		<style
			children='
				html, body {
					position: fixed;
					overflow: hidden;
					width: 100vw;
					height: 100vh;
				}
			'
		/>
	</Head>;
}

export function StatusBarOverscrollColor(props: { color?: string; }) {
	var css = props.color || '#171d33';
	return <Head>
		<meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
		<meta name='theme-color' content={css} />
		<style children={` body { background-color: ${css} !important; } `} />
		<style children={` :root { background-color: ${css} !important; } `} />
	</Head>;
}
