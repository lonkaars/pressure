import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

function Keybind(props: {
	keyName: string;
}) {
	return <span className='keybind'>{props.keyName}</span>;
}

function KeybindSelectorInner(props: {
	value: string[];
}) {
	return <div className='keybind-selector-inner'>
		{props.value.map(s => <Keybind keyName={s} />)}
	</div>;
}

export default function KeybindSelector(props: {
	label: string;
	value: string[];
	onChange?: (newValue: string[]) => any;
}) {
	var [tempID, _setTempID] = useState(uuid());

	return <FormControl variant='filled' className='keybind-selector' tabIndex={0}>
		<InputLabel htmlFor={tempID} shrink>{props.label}</InputLabel>
		<FilledInput id={tempID} inputComponent={() => <KeybindSelectorInner value={props.value} />} />
	</FormControl>;
}
