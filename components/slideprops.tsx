import { State } from '@hookstate/core';

import TextField from '@material-ui/core/TextField';

import TimecodeInput from '../components/timeinput';
import { globalState } from '../pages/editor';
import { TimedVideoPlayer } from '../pages/present';
import { anySlide, loopSlide } from '../timeline';

export default function SlideProperties(props: {
	slide: State<anySlide>;
	global: State<globalState>;
	player: TimedVideoPlayer;
}) {
	if (props.slide.value.type == 'default') return null;

	return <div className='section'>
		<span className='title'>Properties</span>
		{{
			'loop': <>
				<TextField
					label='Duration'
					variant='filled'
					type='number'
					value={(props.slide as State<loopSlide>).frame.get()
						- (props.slide as State<loopSlide>).beginFrame.get()}
				/>
				<TimecodeInput
					label='Start timestamp'
					value={(props.slide as State<loopSlide>).beginFrame.get()}
					update={newValue => {
						(props.slide as State<loopSlide>).frame.set(newValue);
						props.global.update.refreshLiveTimeline.value();
					}}
					player={props.player}
				/>
				<TimecodeInput
					label='End timestamp'
					value={(props.slide as State<loopSlide>).frame.get()}
					update={newValue => {
						(props.slide as State<loopSlide>).frame.set(newValue);
						props.global.update.refreshLiveTimeline.value();
					}}
					player={props.player}
				/>
				<TextField label='End timestamp' variant='filled' />
			</>,
			'delay': <>
				<TextField label='Delay duration' variant='filled' />
			</>,
			'speedChange': <>
				<TextField label='New speed' variant='filled' />
				<TextField label='Factor' variant='filled' />
			</>,
		}[props.slide.value.type]}
	</div>;
}
