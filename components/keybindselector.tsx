import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

function Keybind(props: {
	keyName: string;
	onClick?: () => any;
}) {
	return <span className='keybind' onClick={props.onClick}>{props.keyName}</span>;
}

var keyBlacklist = [
	'Shift',
	'Control',
	'Alt',
	'Meta',
];
var keyMap = {
	' ': 'Space',
	'ArrowDown': 'Down',
	'ArrowLeft': 'Left',
	'ArrowRight': 'Right',
	'ArrowUp': 'Up',
};

export default function KeybindSelector(props: {
	label: string;
	value: string[];
	onChange?: (newValue: string[]) => any;
}) {
	var [inputID, _setInputID] = useState(uuid());

	function KeybindSelectorInner() {
		return <div className='keybind-selector-inner'>
			{props.value.map(s =>
				<Keybind
					keyName={s}
					onClick={() => {
						props.onChange?.(props.value.filter(v => v != s));
					}}
				/>
			)}
			{props.value.length == 0 && <span className='placeholder'>Unbound</span>}
		</div>;
	}

	return <FormControl
		variant='filled'
		className='keybind-selector'
		tabIndex={0}
		onKeyDown={e => {
			e.preventDefault();
			var key = e.key;

			if (key in keyMap) key = keyMap[key];
			if (keyBlacklist.includes(key)) return;

			var newArr = Array.from(props.value);
			if (!newArr.includes(key)) newArr.push(key);

			props.onChange(newArr);
		}}
	>
		<InputLabel htmlFor={inputID} shrink>{props.label}</InputLabel>
		<FilledInput id={inputID} inputComponent={() => <KeybindSelectorInner />} />
	</FormControl>;
}
