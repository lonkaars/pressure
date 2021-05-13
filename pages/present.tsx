import Button from '@material-ui/core/Button';
import Ajv from 'ajv';
import { useEffect, useState } from 'react';
import timeline, { slide } from '../timeline';
import * as timelineSchema from '../timeline.schema.json';

import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import SettingsRemoteRoundedIcon from '@material-ui/icons/SettingsRemoteRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import MovieRoundedIcon from '@material-ui/icons/MovieRounded';

class TimedVideoPlayer {
	slide: number;
	timeline: timeline;
	precision: number;
	player: HTMLVideoElement;
	video: string;

	constructor(public framerate: number) {
		this.slide = -1;
		this.precision = 3;
	}

	timestampToFrame(timestamp: number): number {
		return Math.round((timestamp * 1e3) / (1e3 / this.framerate));
	}

	frameToTimestamp(frame: number): number {
		return frame / this.framerate;
	}

	registerPlayer(player: HTMLVideoElement) {
		this.player = player;
		if (this.video) this.player.src = this.video;
		this.registerEventListeners();
	}

	jumpToFrame(frame: number) {
		this.player.currentTime = this.frameToTimestamp(frame);
	}

	handleSlide(slide: slide) {
		this.jumpToFrame(slide.frame);
		this.player.pause();
	}

	registerEventListeners() {
		if (
			!this.video
			|| !this.player
			|| !this.timeline
		) {
			return;
		}

		setInterval(() => {
			if (this.player.paused) return;
			var frame = this.timestampToFrame(this.player.currentTime);

			// debug
			document.getElementById('frame').innerText = frame.toString();

			var slide = this.timeline.slides[this.slide];
			if (!slide) return;

			if (frame >= slide.frame) {
				this.handleSlide(slide);
			}
		}, 1e3 / (this.precision * this.framerate));
	}

	loadVideo(base64Video: string) {
		this.video = base64Video;
		if (this.player) this.player.src = this.video;
		this.registerEventListeners();
	}

	loadSlides(jsonString: string) {
		try {
			var timeline = JSON.parse(jsonString);
		} catch (e) {
			console.log('invalid json object!' + e);
			return;
		}
		var ajv = new Ajv({ allErrors: true });
		var validate = ajv.compile(timelineSchema);
		if (!validate(timeline)) {
			console.log('schema not passed!');
			return;
		}

		this.timeline = timeline as timeline;

		this.registerEventListeners();
	}

	next() {
		this.slide++;
		this.player.play();
	}

	previous() {
		console.log('previous slide');
	}
}

export default function Present() {
	useEffect(() => {
		setInterval(() => {
			document.getElementById('time').innerText = new Date().toLocaleTimeString();
		}, 500);
	}, []);

	var player = new TimedVideoPlayer(60);

	useEffect(() => {
		var videoEL = document.getElementById('player') as HTMLVideoElement;
		player.registerPlayer(videoEL);
		/* videoEL.addEventListener('loadeddata', () => { */
		/* 	console.log('initial load'); */
		/* }); */
		/* videoEL.addEventListener('canplaythrough', () => { */
		/* 	console.log('full load') */
		/* }); */
	}, []);

	return <div className='presentation posfix a0 h100vh'>
		<div className='slideWrapper abscenterv posrel'>
			<div className='slide posrel'>
				<div className='innner posabs a0'>
					<video id='player' className='fullwidth' />
				</div>
			</div>
		</div>
		<div className='fullscreenControls posabs a0'>
			<div className='control previous' onClick={player.previous}>
				<span id='frame'>0</span>
			</div>
			<div
				className='control menu'
				onClick={() => {
					document.getElementById('menu').classList.add('active');
				}}
			/>
			<div className='control next' onClick={() => player.next()} />
		</div>
		<div className='menu posabs a0' id='menu'>
			<div
				className='background posabs a0'
				onClick={() => {
					document.getElementById('menu').classList.remove('active');
				}}
			/>
			<div className='info sidebyside posabs h0 b0'>
				<div className='timetitle floatb'>
					<h3 className='time numbers nobr' id='time'>14:00:41</h3>
					<h1 className='title nobr'>PWS Presentatie</h1>
				</div>
				<div className='buttons floatb'>
					<div className='inner center'>
						{false && <Button
							variant='contained'
							color='default'
							className='bg-err'
							startIcon={<ExitToAppRoundedIcon />}
							children='Stop presentation'
						/>}
						<Button
							variant='contained'
							color='default'
							startIcon={<PlayArrowRoundedIcon />}
							children='Resume presentation'
							onClick={() => {
								document.getElementById('menu').classList.remove('active');
							}}
						/>
						<input
							type='file'
							id='vidUpload'
							accept='video/*'
							className='dispnone'
							onChange={event => {
								var file = event.target.files[0];
								console.log(event.target.files);
								if (!file) return;
								console.log('new fileReader!');
								var reader = new FileReader();
								reader.addEventListener('error', () => {
									console.log('reader error');
								});
								reader.addEventListener('abort', () => {
									console.log('reader abortus');
								});
								reader.addEventListener('load', ev => {
									console.log('reader done!');
									player.loadVideo(ev.target.result as string);
								});
								reader.addEventListener('progress', (progEv) => {
									console.log(progEv.loaded);
								});
								reader.readAsDataURL(file);
							}}
						/>
						<input
							type='file'
							id='jsonUpload'
							accept='application/json'
							className='dispnone'
							onChange={event => {
								var file = event.target.files[0];
								console.log(event.target.files);
								if (!file) return;
								console.log('new fileReader!');
								var reader = new FileReader();
								reader.addEventListener('error', () => {
									console.log('reader error');
								});
								reader.addEventListener('abort', () => {
									console.log('reader abortus');
								});
								reader.addEventListener('load', ev => {
									console.log('reader done!');
									player.loadSlides(ev.target.result as string);
								});
								reader.addEventListener('progress', (progEv) => {
									console.log(progEv.loaded);
								});
								reader.readAsText(file);
							}}
						/>
						<Button
							variant='contained'
							color='default'
							children='Load video'
							startIcon={<MovieRoundedIcon />}
							onClick={() => document.getElementById('vidUpload').click()}
						/>
						<Button
							variant='contained'
							color='default'
							children='Load json'
							startIcon={<CodeRoundedIcon />}
							onClick={() => document.getElementById('jsonUpload').click()}
						/>
						{false && <Button
							variant='contained'
							color='default'
							startIcon={<SettingsRemoteRoundedIcon />}
							children='Connect remote'
						/>}
						{false && <Button
							variant='contained'
							color='default'
							startIcon={<SettingsRoundedIcon />}
							children='Settings'
						/>}
					</div>
				</div>
				<div className='slide posrel floatb'>
					<h3 className='time numbers nobr posrel'>slide 1/15</h3>
				</div>
			</div>
		</div>
	</div>;
}
