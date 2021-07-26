import TextField from '@material-ui/core/TextField';
import { TimedVideoPlayer } from '../pages/present';

export default function TimecodeInput(props: {
	value: number;
	update: (newValue: number) => void;
	player: TimedVideoPlayer;
	label: string;
	className?: string;
}) {
	return <TextField
		className={'time-input ' + (props.className || '')}
		variant='filled'
		label={props.label}
		value={props.player.frameToTimestampString(props.value, false)}
		spellCheck={false}
		onChange={e => e.preventDefault()}
		onKeyDown={e => {
			var mod = 1;
			if (e.shiftKey) mod = 10;

			if (e.key == 'ArrowUp') props.update(props.value + mod);
			if (e.key == 'ArrowDown') props.update(props.value - mod);
		}}
		onWheel={e => {
			var mod = 1;
			if (e.shiftKey) mod = 10;

			if (e.deltaY < 0) props.update(props.value + mod);
			if (e.deltaY > 0) props.update(props.value - mod);
		}}
	/>;
}
