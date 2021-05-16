import { CSSProperties } from 'react';
import { SlideKeyframe } from './icons';

export default function Loop(props: {
	length: number;
}) {
	return <div style={{ '--loop-length': props.length } as CSSProperties} className='loop'>
		<SlideKeyframe type='loop' />
		<div className='connector dispinbl' />
		<SlideKeyframe type='loop' loopEnd />
	</div>;
}
