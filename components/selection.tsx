import { CSSProperties } from 'react';
import { slideTypes } from '../timeline';

type cornerTypes = 'round' | 'diamond' | 'square' | 'square-s';
var slideTypeToCornerType = {
	default: 'diamond',
	loop: 'square',
	speedChange: 'square',
	delay: 'round',
};

function Corner(props: {
	type: cornerTypes;
	direction: 'tl' | 'tr' | 'bl' | 'br';
}) {
	var className = 'corner posabs ' + props.direction + ' ';

	if (props.direction[0] == 't') className += 't0 ';
	if (props.direction[0] == 'b') className += 'b0 ';
	if (props.direction[1] == 'l') className += 'l0 ';
	if (props.direction[1] == 'r') className += 'r0 ';

	var style: CSSProperties = { transform: '' };
	if (props.direction[0] == 'b') style.transform += 'scaleY(-1) ';
	if (props.direction[1] == 'l') style.transform += 'scaleX(-1) ';

	if (props.type == 'square-s') {
		className += 'small ';
		return <svg
			className={className}
			style={style}
			width='6'
			height='6'
			viewBox='0 0 6 6'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path className='outline' d='M0 0V2C2.20914 2 4 3.79083 4 6H6C6 2.68628 3.31371 0 0 0Z' />
			<path className='fill' d='M0 4V0C2.20914 0 4 1.79083 4 4H0Z' />
		</svg>;
	}

	return <svg
		className={className}
		style={style}
		width='12'
		height='12'
		viewBox='0 0 12 12'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		{{
			'round': <>
				<path
					className='outline'
					d='M0 0V2C0.185921 2 0.370657 2.00507 0.554077 2.01509C1.22229 2.05158 1.87304 2.15368 2.5 2.31505C5.5312 3.09523 8.00618 5.26093 9.20959 8.09678C9.65396 9.14397 9.92495 10.2825 9.98653 11.4765C9.99547 11.6498 10 11.8244 10 12H12C12 11.8325 11.9966 11.6658 11.9898 11.5C11.929 10.0177 11.5994 8.60473 11.0483 7.3086C9.57234 3.83704 6.50794 1.20364 2.76743 0.320679C1.9651 0.131286 1.13166 0.0224302 0.276113 0.00311406C0.184326 0.00104172 0.0922847 0 0 0Z'
				/>
				<path
					className='fill'
					d='M0 10V0C0.185921 0 0.370657 0.00507374 0.554077 0.0150905C1.22229 0.0515824 1.87304 0.153677 2.5 0.315045C5.5312 1.09523 8.00618 3.26093 9.20959 6.09678C9.65396 7.14397 9.92495 8.28253 9.98653 9.47645C9.99547 9.64984 10 9.82439 10 10H0Z'
				/>
			</>,
			'diamond': <>
				<path
					className='outline'
					d='M4.5858 1.75739L10.2427 7.41424C11.3679 8.53946 12 10.0656 12 11.6569L12 12L10 12L10 11.6569C10 10.596 9.57858 9.57859 8.82845 8.82844L3.1716 3.17159C2.42145 2.42147 1.40403 1.99999 0.343174 2.00001L0 1.99999L2.15792e-05 1.07896e-05L0.343141 0C1.93447 1.07896e-05 3.46059 0.632151 4.5858 1.75739Z'
				/>
				<path
					className='fill'
					d='M10 10L0 10V0L0.343174 2.15769e-05C1.40403 0 2.42145 0.421474 3.1716 1.1716L8.82845 6.82845C9.57858 7.5786 10 8.59598 10 9.65689L10 10Z'
				/>
			</>,
			'square': <>
				<path
					className='outline'
					d='M6 0H0.5H0V2H0.5H6C8.20914 2 10 3.79083 10 6V11.5V12H12V11.5V6C12 2.68628 9.31371 0 6 0Z'
				/>
				<path className='fill' d='M0 10V0H0.5H6C8.20914 0 10 1.79083 10 4V9.5V10H0Z' />
			</>,
		}[props.type]}
	</svg>;
}

export default function Selection(props: {
	width: number;
	height: number;
	frameWidth: number;
	left?: slideTypes;
	right?: slideTypes;
	className?: string;
	widthOffset?: number;
}) {
	var small = (props.width + props.widthOffset) < 24 || props.height < 24 || !props.left || !props.right;
	return <div
		className={'selection ' + props.className}
		style={{
			width: `calc(var(--zoom) * ${props.frameWidth} * 1px + 12px + ${props.widthOffset} * 1px)`,
			height: props.height,
			'--corner-size': small ? '6px' : '12px',
		} as CSSProperties}
	>
		<div className='background fill left posabs dispinbl l0' />
		<div className='background fill center posabs dispinbl v0' />
		<div className='background fill right posabs dispinbl r0' />
		<div className='posabs dispinbl t0 bar top' />
		<div className='posabs dispinbl r0 bar right' />
		<div className='posabs dispinbl b0 bar bottom' />
		<div className='posabs dispinbl l0 bar left' />
		<Corner type={small ? 'square-s' : slideTypeToCornerType[props.right] as cornerTypes} direction='tr' />
		<Corner type={small ? 'square-s' : slideTypeToCornerType[props.right] as cornerTypes} direction='br' />
		<Corner type={small ? 'square-s' : slideTypeToCornerType[props.left] as cornerTypes} direction='tl' />
		<Corner type={small ? 'square-s' : slideTypeToCornerType[props.left] as cornerTypes} direction='bl' />
	</div>;
}
