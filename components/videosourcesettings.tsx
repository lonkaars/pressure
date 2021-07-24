import { useRef } from 'react';
import { TimedVideoPlayer } from '../pages/present';
import { arrayBufferToBase64, LocalVideo } from '../project';

import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';

import { UploadRoundedIcon } from './icons';

type VideoSourceSettings = {
	settings: LocalVideo;
	player: TimedVideoPlayer;
};

export function LocalVideoSettings(props: VideoSourceSettings) {
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
					var video = ev.target.result as ArrayBuffer;
					props.settings.load(video);
					props.settings.mimetype = file.type;
					props.player.loadVideo(arrayBufferToBase64(video, file.type));
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
