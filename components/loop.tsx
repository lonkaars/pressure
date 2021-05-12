import { SlideKeyframe } from './icons';

export default function Loop(props: {
	width: number;
}) {
	return <div style={{ width: props.width }} className='loop'>
		<SlideKeyframe type='loop' />
		<div className='connector dispinbl' />
		<SlideKeyframe type='loop' loopEnd />
	</div>;
}
