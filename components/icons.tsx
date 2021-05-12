import { keyframeTypes } from '../timeline';

export function PressureIcon() {
	return <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M18 30L14 44H18L22 30H18Z' fill='url(#paint0_linear)' />
		<path d='M30 44L26 30H30L34 44H30Z' fill='url(#paint1_linear)' />
		<path
			d='M28 6C28 8.20914 26.2091 10 24 10C21.7909 10 20 8.20914 20 6C20 3.79086 21.7909 2 24 2C26.2091 2 28 3.79086 28 6Z'
			fill='url(#paint2_linear)'
		/>
		<path
			d='M42 32C40.9391 32 39.9217 31.5786 39.1716 30.8284C38.4214 30.0783 38 29.0609 38 28C38 26.9391 38.4214 25.9217 39.1716 25.1716C39.9217 24.4214 40.9391 24 42 24C43.0609 24 44.0783 24.4214 44.8284 25.1716C45.5786 25.9217 46 26.9391 46 28C46 29.0609 45.5786 30.0783 44.8284 30.8284C44.0783 31.5786 43.0609 32 42 32ZM46 20H38C37.4696 20 36.9609 20.2107 36.5858 20.5858C36.2107 20.9609 36 21.4696 36 22V46C36 46.5304 36.2107 47.0391 36.5858 47.4142C36.9609 47.7893 37.4696 48 38 48H46C46.5304 48 47.0391 47.7893 47.4142 47.4142C47.7893 47.0391 48 46.5304 48 46V22C48 21.4696 47.7893 20.9609 47.4142 20.5858C47.0391 20.2107 46.5304 20 46 20Z'
			fill='url(#paint3_linear)'
		/>
		<path d='M38 10H10V28H34V22C34 20 36 18 38 18V10Z' fill='url(#paint4_linear)' />
		<g filter='url(#filter0_d)'>
			<path d='M6 6H42V18H38V10H10V28H34V32H6V6Z' fill='url(#paint5_linear)' />
			<path d='M30 14L34 18V20L30 24H28V14H30Z' fill='url(#paint6_linear)' />
			<path d='M20 14H24V24H20V14Z' fill='url(#paint7_linear)' />
			<path d='M14 14H18V24H14V14Z' fill='url(#paint8_linear)' />
		</g>
		<g filter='url(#filter1_d)'>
			<rect x='4' y='6' width='40' height='4' fill='#5DE9AE' />
		</g>
		<defs>
			<filter
				id='filter0_d'
				x='2'
				y='3'
				width='44'
				height='34'
				filterUnits='userSpaceOnUse'
				color-interpolation-filters='sRGB'
			>
				<feFlood flood-opacity='0' result='BackgroundImageFix' />
				<feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
				<feOffset dy='1' />
				<feGaussianBlur stdDeviation='2' />
				<feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
				<feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow' />
				<feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow' result='shape' />
			</filter>
			<filter
				id='filter1_d'
				x='0'
				y='3'
				width='48'
				height='12'
				filterUnits='userSpaceOnUse'
				color-interpolation-filters='sRGB'
			>
				<feFlood flood-opacity='0' result='BackgroundImageFix' />
				<feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
				<feOffset dy='1' />
				<feGaussianBlur stdDeviation='2' />
				<feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
				<feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow' />
				<feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow' result='shape' />
			</filter>
			<linearGradient id='paint0_linear' x1='24' y1='2' x2='24' y2='44' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#5DE9AE' />
				<stop offset='1' stop-color='#4081E2' />
			</linearGradient>
			<linearGradient id='paint1_linear' x1='24' y1='2' x2='24' y2='44' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#5DE9AE' />
				<stop offset='1' stop-color='#4081E2' />
			</linearGradient>
			<linearGradient id='paint2_linear' x1='24' y1='2' x2='24' y2='44' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#5DE9AE' />
				<stop offset='1' stop-color='#4081E2' />
			</linearGradient>
			<linearGradient id='paint3_linear' x1='42' y1='20' x2='42' y2='48' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#8045FE' />
				<stop offset='1' stop-color='#C482ED' />
			</linearGradient>
			<linearGradient id='paint4_linear' x1='24' y1='10' x2='24' y2='28' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#3E4299' />
				<stop offset='1' stop-color='#020122' />
			</linearGradient>
			<linearGradient id='paint5_linear' x1='24' y1='6' x2='24' y2='32' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#6FE4E4' />
				<stop offset='1' stop-color='#6268E6' />
			</linearGradient>
			<linearGradient id='paint6_linear' x1='24' y1='6' x2='24' y2='32' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#6FE4E4' />
				<stop offset='1' stop-color='#6268E6' />
			</linearGradient>
			<linearGradient id='paint7_linear' x1='24' y1='6' x2='24' y2='32' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#6FE4E4' />
				<stop offset='1' stop-color='#6268E6' />
			</linearGradient>
			<linearGradient id='paint8_linear' x1='24' y1='6' x2='24' y2='32' gradientUnits='userSpaceOnUse'>
				<stop stop-color='#6FE4E4' />
				<stop offset='1' stop-color='#6268E6' />
			</linearGradient>
		</defs>
	</svg>;
}

export function SlideKeyframe(props: {
	type: keyframeTypes;
	loopEnd?: boolean;
}) {
	return <svg
		className='keyframe'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		{{
			'default': <path
				d='M10.2929 19.2929L4.70711 13.7071C4.25435 13.2544 4 12.6403 4 12C4 11.3597 4.25435 10.7456 4.70711 10.2929L10.2929 4.70711C10.7456 4.25435 11.3597 4 12 4C12.6403 4 13.2544 4.25435 13.7071 4.70711L19.2929 10.2929C19.7456 10.7456 20 11.3597 20 12C20 12.6403 19.7456 13.2544 19.2929 13.7071L13.7071 19.2929C13.2544 19.7456 12.6403 20 12 20C11.3597 20 10.7456 19.7456 10.2929 19.2929Z'
			/>,
			'delay': <circle cx='12' cy='12' r='8' />,
			'speedChange': <path
				d='M4 18V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18Z'
			/>,
			'loop': !props.loopEnd
				? <path
					d='M9 6C9 4.89543 9.89543 4 11 4H15C16.1046 4 17 4.89543 17 6C17 7.10457 16.1046 8 15 8H13V16H15C16.1046 16 17 16.8954 17 18C17 19.1046 16.1046 20 15 20H11C9.89543 20 9 19.1046 9 18V6Z'
				/>
				: <path
					d='M15 18C15 19.1046 14.1046 20 13 20H9C7.89543 20 7 19.1046 7 18C7 16.8954 7.89543 16 9 16H11V8H9C7.89543 8 7 7.10457 7 6C7 4.89543 7.89543 4 9 4H13C14.1046 4 15 4.89543 15 6V18Z'
				/>,
		}[props.type]}
	</svg>;
}