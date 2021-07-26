import TextField from '@material-ui/core/TextField';
import { useEffect, useRef } from 'react';
import { TimedVideoPlayer } from '../pages/present';

export default function TimecodeInput(props: {
	value: number;
	update: (newValue: number) => void;
	player: TimedVideoPlayer;
	label: string;
	className?: string;
}) {
	var ref = useRef(null);

	function handleMod(e: KeyboardEvent | WheelEvent) {
		var mod = 1;
		if (e.shiftKey) mod = 10;
		var dir = 0;

		if (e instanceof KeyboardEvent) {
			if (e.key == 'ArrowUp') dir = 1;
			if (e.key == 'ArrowDown') dir = -1;
		} else if (e instanceof WheelEvent) {
			if (e.deltaY < 0) dir = 1;
			if (e.deltaY > 0) dir = -1;
		}

		var updateVal = mod * dir;
		if (updateVal == 0) return;
		props.update(props.value + updateVal);
	}

	var stopScroll = (e: WheelEvent) => e.preventDefault();
	useEffect(() => {
		(ref.current as HTMLDivElement).addEventListener('wheel', stopScroll, { passive: false });
		return () => (ref.current as HTMLDivElement)?.removeEventListener('wheel', stopScroll);
	});

	return <TextField
		className={'time-input ' + (props.className || '')}
		variant='filled'
		label={props.label}
		value={props.player.frameToTimestampString(props.value, false)}
		spellCheck={false}
		onChange={e => e.preventDefault()}
		onKeyDown={e => handleMod(e.nativeEvent)}
		onWheel={e => handleMod(e.nativeEvent)}
		ref={ref}
	/>;
}
