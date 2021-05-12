import Button from '@material-ui/core/Button';
import { useEffect, useState } from 'react';

import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import SettingsRemoteRoundedIcon from '@material-ui/icons/SettingsRemoteRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

function previous() {
	console.log('previous slide');
}

function next() {
	console.log('next slide');
}

export default function Present() {
	useEffect(() => {
		setInterval(() => {
			document.getElementById('time').innerText = new Date().toLocaleTimeString();
		}, 500);
	}, []);

	var [ videoSRC, setVideoSRC ] = useState("");

	useEffect(() => {
		var videoEL = document.getElementById("player") as HTMLVideoElement;
		videoEL.addEventListener('loadeddata', () => {
			console.log("initial load")
		})
		videoEL.addEventListener('canplaythrough', () => {
			console.log("full load")
			videoEL.play();
		})
	}, []);

	return <div className='presentation posfix a0 h100vh'>
		<div className='slideWrapper abscenterv posrel'>
			<div className='slide posrel'>
				<div className="innner posabs a0">
					<video src={videoSRC} id="player" className="fullwidth"/>
				</div>
			</div>
		</div>
		<div className='fullscreenControls posabs a0'>
			<div className='control previous' onClick={previous} >
				<input
					type='file'
					id='vidUpload'
					accept='video/*'
					className="dispnone"
					onChange={event => {
						var file = event.target.files[0];
						console.log(event.target.files)
						if (!file) return;
						console.log('new fileReader!')
						var reader = new FileReader();
						reader.addEventListener('error', () => {
							console.log("reader error");
						})
						reader.addEventListener('abort', () => {
							console.log("reader abortus");
						})
						reader.addEventListener('load', ev => {
							console.log("reader done!")
							setVideoSRC(ev.target.result as string);
						})
						reader.addEventListener('progress', (progEv) => {
							console.log(progEv.loaded)
						})
						reader.readAsDataURL(file);
					}}
				/>
				<Button
					variant='contained'
					color='default'
					children='load video'
					onClick={() => document.getElementById("vidUpload").click()}
				/>
				<Button
					variant='contained'
					color='default'
					children='load json'
				/>
			</div>
			<div
				className='control menu'
				onClick={() => {
					document.getElementById('menu').classList.add('active');
				}}
			/>
			<div className='control next' onClick={next} />
		</div>
		<div className='menu posabs a0' id='menu'>
			<div
				className='background posabs a0'
				onClick={() => {
					document.getElementById('menu').classList.remove('active');
				}}
			/>
			<div className='info sidebyside posabs h0 b0'>
				<div className='timetitle'>
					<h3 className='time numbers nobr' id='time'>14:00:41</h3>
					<h1 className='title nobr'>PWS Presentatie</h1>
				</div>
				<div className='buttons floatb'>
					<div className='inner center'>
						<Button
							variant='contained'
							color='default'
							className='bg-err'
							startIcon={<ExitToAppRoundedIcon />}
							children='Stop presentation'
						/>
						<Button
							variant='contained'
							color='default'
							startIcon={<PlayArrowRoundedIcon />}
							children='Resume presentation'
							onClick={() => {
								document.getElementById('menu').classList.remove('active');
							}}
						/>
						<Button
							variant='contained'
							color='default'
							startIcon={<SettingsRemoteRoundedIcon />}
							children='Connect remote'
						/>
						<Button
							variant='contained'
							color='default'
							startIcon={<SettingsRoundedIcon />}
							children='Settings'
						/>
					</div>
				</div>
				<div className='slide posrel floatb'>
					<h3 className='time numbers nobr posrel'>slide 1/15</h3>
				</div>
			</div>
		</div>
	</div>;
}
