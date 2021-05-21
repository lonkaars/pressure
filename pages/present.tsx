import Button from '@material-ui/core/Button';
import Ajv from 'ajv';
import { useEffect, useState } from 'react';
import Timecode from 'timecode-boss';
import timeline, { delaySlide, loopSlide, slide, speedChangeSlide } from '../timeline';
import * as timelineSchema from '../timeline.schema.json';

import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import SettingsRemoteRoundedIcon from '@material-ui/icons/SettingsRemoteRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import MovieRoundedIcon from '@material-ui/icons/MovieRounded';

export class TimedVideoPlayer {
	slide: number;
	timeline: timeline;
	precision: number;
	player: HTMLVideoElement;
	video: string;
	registeredEventListeners: boolean;
	frame: number;
	framerate: number;

	constructor() {
		this.slide = -1;
		this.precision = 3;
		this.frame = 0;
		this.framerate = 0;
		this.registeredEventListeners = false;
	}

	frameToTimestampString(frame: number, trim: boolean = true) {
		var timecodeString = new Timecode(frame, this.framerate).toString();
		if (trim) timecodeString = timecodeString.replace(/^(00:)+/, '');
		timecodeString = timecodeString.replace(';', '.')
			.replace(/(:)(\d+?)$/, '.$2')
			+ 'f';
		if (timecodeString == '00f') timecodeString = '0';
		return timecodeString;
	}

	timestampToFrame(timestamp: number): number {
		return Math.ceil((timestamp * 1e3) / (1e3 / this.framerate));
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
		this.frame = frame;
	}

	jumpToSlide(slide: slide) {
		this.jumpToFrame(slide.frame);
		this.player.playbackRate = this.getPlaybackSpeed(this.slide);
		this.player.pause();
	}

	getPlaybackSpeed(slide: number) {
		for (var i = slide; i > -1; i--) {
			var previousSlide = this.timeline.slides[i];
			if (previousSlide.type != 'speedChange') {
				continue;
			}
			return this.framerate / (previousSlide as speedChangeSlide).newFramerate;
		}
		return 1;
	}

	handleSlide(slide: slide) {
		switch (slide.type) {
			case 'loop': {
				this.jumpToFrame((slide as loopSlide).beginFrame);
				break;
			}
			case 'delay': {
				this.player.playbackRate = 0;
				this.slide++;
				setTimeout(() => {
					this.player.playbackRate = this.getPlaybackSpeed(this.slide - 1);
				}, (slide as delaySlide).delay);
				break;
			}
			case 'speedChange': {
				this.slide++;
				this.player.playbackRate = this.framerate / (slide as speedChangeSlide).newFramerate;
				break;
			}
			default: {
				this.jumpToSlide(slide);
				break;
			}
		}
	}

	addEventListener(name: string, callback: (...args: any[]) => void) {
		return document.addEventListener(name, callback, false);
	}

	dispatchEvent(event: CustomEvent) {
		return document.dispatchEvent(event);
	}

	registerEventListeners() {
		if (
			!this.video
			|| !this.player
			|| !this.timeline
			|| this.registeredEventListeners
		) {
			return;
		}

		setInterval(() => {
			if (this.player.paused) return;

			var lastFrame = this.frame;
			this.frame = this.timestampToFrame(this.player.currentTime);

			var event = new CustomEvent('TimedVideoPlayerOnFrame', { detail: this.frame });
			this.dispatchEvent(event);

			var slide = this.timeline.slides[this.slide];
			if (!slide) return;

			if (this.frame >= slide.frame) {
				this.handleSlide(slide);
			}
		}, 1e3 / (this.precision * this.framerate));

		this.registeredEventListeners = true;
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
		this.framerate = this.timeline.framerate;

		this.timeline.slides[-1] = {
			frame: 0,
			type: 'default',
			clickThroughBehaviour: 'ImmediatelySkip',
		};

		this.registerEventListeners();
	}

	skip() {
		var slide = this.timeline.slides[this.slide - 1];
		if (slide.clickThroughBehaviour == 'ImmediatelySkip') this.jumpToSlide(slide);
	}

	next() {
		if (!this.registeredEventListeners) return;

		this.slide++;

		var slide = this.timeline.slides[this.slide];

		if (!this.player.paused && this.frame < slide?.frame) {
			this.skip();
		}

		this.player.play();
	}

	previous() {
		if (!this.registeredEventListeners) return;

		this.slide = Math.max(this.slide - 1, -1);

		var slide = this.timeline.slides[this.slide];
		if (!slide) return;

		this.jumpToSlide(slide);
	}
}

export default function Present() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);
	var [player, setPlayer] = useState(new TimedVideoPlayer());

	useEffect(() => {
		setInterval(() => {
			document.getElementById('time').innerText = new Date().toLocaleTimeString();
		}, 500);
	}, []);

	useEffect(() => {
		var videoEL = document.getElementById('player') as HTMLVideoElement;
		player.registerPlayer(videoEL);
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
			<div
				className='control previous'
				onClick={() => {
					player.previous();
					rerender();
				}}
			/>
			<div
				className='control menu'
				onClick={() => {
					document.getElementById('menu').classList.add('active');
				}}
			/>
			<div
				className='control next'
				onClick={() => {
					player.next();
					rerender();
				}}
			/>
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
					<h1 className='title nobr'>{player.timeline?.name || '???'}</h1>
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
								if (!file) return;
								var reader = new FileReader();
								reader.addEventListener('load', ev => {
									player.loadVideo(ev.target.result as string);
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
								if (!file) return;
								var reader = new FileReader();
								reader.addEventListener('load', ev => {
									player.loadSlides(ev.target.result as string);
									rerender();
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
					<h3 className='time numbers nobr posrel'>
						slide {player.slide + 1}/{player.timeline?.slides.length || 0}
					</h3>
				</div>
			</div>
		</div>
	</div>;
}
