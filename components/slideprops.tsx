import { State } from '@hookstate/core';
import { Downgraded } from '@hookstate/core';
import { SpringRef } from 'react-spring';

import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import TimecodeInput from '../components/timeinput';
import { globalState, slideAPIprops } from '../pages/editor';
import { TimedVideoPlayer } from '../pages/present';
import { anySlide, delaySlide, loopSlide } from '../timeline';

interface SlidePropertiesPropsType {
	slide: State<anySlide>;
	global: State<globalState>;
	player: TimedVideoPlayer;
	api: SpringRef<slideAPIprops>;
	select: (slides: anySlide[]) => void;
}

function SlideTimestamp(props: SlidePropertiesPropsType) {
	return <TimecodeInput
		label='Timestamp'
		value={props.slide.frame.get()}
		update={(newValue: number) => {
			props.slide.frame.set(newValue);
			props.api.start({ frame: newValue });
			props.select([props.slide.attach(Downgraded).value]);
			props.global.update.refreshLiveTimeline.value();
		}}
		player={props.player}
	/>;
}

export default function SlideProperties(props: SlidePropertiesPropsType) {
	function updateProp<slideType extends anySlide>(key: keyof slideType) {
		return (newValue: any) => { // TODO: better typing here
			props.slide[key as keyof State<anySlide>].set(newValue);
			props.global.update.refreshLiveTimeline.value();
		};
	}

	return <div className='section'>
		<span className='title'>Properties</span>
		{{
			'default': <>
				<SlideTimestamp {...props} />
			</>,
			'loop': <>
				<TextField
					label='Duration'
					variant='filled'
					type='number'
					value={(props.slide as State<loopSlide>).frame.get()
						- (props.slide as State<loopSlide>).beginFrame.get()}
				/>
				<div className='spacer' />
				<TimecodeInput
					label='Start timestamp'
					value={(props.slide as State<loopSlide>).beginFrame.get()}
					update={updateProp<loopSlide>('beginFrame')}
					player={props.player}
				/>
				<TimecodeInput
					label='End timestamp'
					value={(props.slide as State<loopSlide>).frame.get()}
					update={updateProp<loopSlide>('frame')}
					player={props.player}
				/>
			</>,
			'delay': <>
				<SlideTimestamp {...props} />
				<div className='spacer' />
				<TextField
					variant='filled'
					label='Delay duration'
					type='number'
					InputProps={{ endAdornment: <InputAdornment position='end' children='seconds' /> }}
					InputLabelProps={{ shrink: true }}
					value={(props.slide as State<delaySlide>).delay.get() / 1000}
					onChange={event => updateProp<delaySlide>('delay')(Number(event.target.value) * 1000)}
				/>
			</>,
			'speedChange': <>
				<SlideTimestamp {...props} />
				<div className='spacer' />
				<TextField
					variant='filled'
					label='New speed'
					type='number'
					InputLabelProps={{ shrink: true }}
					InputProps={{ endAdornment: <InputAdornment position='end' children='fps' /> }}
					value={(props.slide as State<delaySlide>).delay.get()}
					onChange={event => updateProp<delaySlide>('delay')(Number(event.target.value))}
				/>
				<div className='spacer' />
				<TextField
					variant='filled'
					type='number'
					label='Factor'
				/>
			</>,
		}[props.slide.value.type]}
	</div>;
}
