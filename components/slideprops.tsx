import { State } from '@hookstate/core';
import { Downgraded } from '@hookstate/core';
import { SpringRef } from 'react-spring';

import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import TimecodeInput from '../components/timeinput';
import { globalState, slideAPIprops } from '../pages/editor';
import { TimedVideoPlayer } from '../pages/present';
import { anySlide, delaySlide, loopBeginSlide, loopSlide, speedChangeSlide } from '../timeline';

interface SlidePropertiesPropsType {
	slide: State<anySlide>;
	global: State<globalState>;
	player: TimedVideoPlayer;
	api: SpringRef<slideAPIprops>;
	select: (slides: anySlide[]) => void;
}

export default function SlideProperties(props: SlidePropertiesPropsType) {
	function updateProp<slideType extends anySlide>(key: keyof slideType, springKey?: keyof slideAPIprops) {
		return (newValue: any) => { // TODO: better typing here
			props.slide[key as keyof State<anySlide>].set(newValue);
			var sel = [props.slide.attach(Downgraded).value];
			if (springKey) props.api.start({ [springKey]: newValue });
			if (sel[0].type == 'loop') {
				sel.push(new loopBeginSlide(sel[0] as loopSlide));
				sel.reverse();
			}
			props.select(sel);
			props.global.update.refreshLiveTimeline.value();
		};
	}

	function SlideTimestamp() {
		return <TimecodeInput
			label='Timestamp'
			value={props.slide.frame.get()}
			update={updateProp('frame', 'frame')}
			player={props.player}
		/>;
	}

	return <div className='section'>
		<span className='title'>Properties</span>
		{{
			'default': <>
				<SlideTimestamp />
			</>,
			'loop': <>
				<TextField
					label='Duration'
					variant='filled'
					type='number'
					value={(props.slide as State<loopSlide>).frame.get()
						- (props.slide as State<loopSlide>).beginFrame.get()}
					onChange={e => {
						var len = Number(e.target.value);
						var frame = (props.slide as State<loopSlide>).beginFrame.get() + len;
						updateProp<loopSlide>('frame', 'frame')(frame);
					}}
				/>
				<div className='spacer' />
				<TimecodeInput
					label='Start timestamp'
					value={(props.slide as State<loopSlide>).beginFrame.get()}
					update={updateProp<loopSlide>('beginFrame', 'begin')}
					player={props.player}
				/>
				<TimecodeInput
					label='End timestamp'
					value={(props.slide as State<loopSlide>).frame.get()}
					update={updateProp<loopSlide>('frame', 'frame')}
					player={props.player}
				/>
			</>,
			'delay': <>
				<SlideTimestamp />
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
				<SlideTimestamp />
				<div className='spacer' />
				<TextField
					variant='filled'
					label='New speed'
					type='number'
					InputLabelProps={{ shrink: true }}
					InputProps={{ endAdornment: <InputAdornment position='end' children='fps' /> }}
					value={(props.slide as State<speedChangeSlide>).newFramerate.get()}
					onChange={event => updateProp<speedChangeSlide>('newFramerate')(Number(event.target.value))}
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
