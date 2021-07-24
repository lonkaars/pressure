import { useRef } from 'react';
import { LocalVideo } from '../project';

import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';

import { UploadRoundedIcon } from './icons';

export function LocalVideoSettings(props: { settings: LocalVideo; }) {
	var fileUploadRef = useRef(null);

	return <>
		<input
			ref={fileUploadRef}
			type='file'
			accept='video/*'
			className='dispnone'
			onChange={event => {
				var file = event.target.files[0];
				if (!file) return;
				var reader = new FileReader();
				reader.addEventListener('load', async ev => {
					props.settings.load(ev.target.result as ArrayBuffer);
				});
				reader.readAsArrayBuffer(file);
			}}
		/>
		<Button
			variant='contained'
			color='default'
			children='Load video'
			onClick={() => (fileUploadRef.current as HTMLInputElement).click()}
			startIcon={<UploadRoundedIcon />}
		/>
		<div className='sidebyside'>
			<span className='body'>Fully buffer video before presentation</span>
			<Switch
				value={props.settings.config.fullyBuffer}
				onChange={() => props.settings.config.fullyBuffer = !props.settings.config.fullyBuffer}
			/>
		</div>
	</>;
}
