import Button from '@material-ui/core/Button';
import { useEffect, useState } from 'react';
import Timecode from 'timecode-boss';
import { FullScreenControls, MenuBarControls } from '../components/controls';
import Project, { arrayBufferToBase64 } from '../project';
import timeline, { delaySlide, loopSlide, slide, speedChangeSlide } from '../timeline';

import DescriptionRoundedIcon from '@material-ui/icons/DescriptionRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import SettingsRemoteRoundedIcon from '@material-ui/icons/SettingsRemoteRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

export class TimedVideoPlayer {
	slide: number;
	timeline: timeline;
	precision: number;
	player: HTMLVideoElement;
	video: string;
	registeredEventListeners: boolean;
	frame: number;
	project: Project;

	constructor() {
		this.slide = -1;
		this.precision = 3;
		this.frame = 0;
		this.registeredEventListeners = false;
	}

	frameToTimestampString(frame: number, trim: boolean = true) {
		var timecodeString = new Timecode(frame, this.project?.video?.framerate).toString();
		if (trim) timecodeString = timecodeString.replace(/^(00:)+/, '');
		timecodeString = timecodeString.replace(';', '.')
			.replace(/(:)(\d+?)$/, '.$2')
			+ 'f';
		if (timecodeString == '00f') timecodeString = '0';
		return timecodeString;
	}

	timestampToFrame(timestamp: number): number {
		return Math.ceil(timestamp * this.project?.video?.framerate);
	}

	frameToTimestamp(frame: number): number {
		return (frame + 1) / this.project?.video?.framerate;
	}

	registerPlayer(player: HTMLVideoElement) {
		this.player = player;
		if (this.video) this.player.src = this.video;
		this.registerEventListeners();
	}

	jumpToFrame(frame: number) {
		this.player.currentTime = this.frameToTimestamp(frame);
		this.frame = frame;

		var event = new CustomEvent('TimedVideoPlayerOnFrame', { detail: this.frame });
		this.dispatchEvent(event);
	}

	jumpToSlide(slide: slide) {
		this.jumpToFrame(slide.frame);
		this.player.playbackRate = this.getPlaybackSpeed(this.slide);
		this.player.pause();
	}

	getPlaybackSpeed(slide: number) {
		for (var i = slide; i > -1; i--) {
			var previousSlide = this.timeline[i];
			if (previousSlide.type != 'speedChange') {
				continue;
			}
			return (previousSlide as speedChangeSlide).newFramerate / this.project?.video?.framerate;
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
				var event = new CustomEvent('TimedVideoPlayerSlide', { detail: this.timeline[this.slide] });
				this.dispatchEvent(event);
				setTimeout(() => {
					this.player.playbackRate = this.getPlaybackSpeed(this.slide - 1);
				}, (slide as delaySlide).delay);
				break;
			}
			case 'speedChange': {
				this.slide++;
				var event = new CustomEvent('TimedVideoPlayerSlide', { detail: this.timeline[this.slide] });
				this.dispatchEvent(event);
				this.player.playbackRate = (slide as speedChangeSlide).newFramerate / this.project?.video?.framerate;
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

			this.frame = this.timestampToFrame(this.player.currentTime);

			var event = new CustomEvent('TimedVideoPlayerOnFrame', { detail: this.frame });
			this.dispatchEvent(event);

			var slide = this.timeline[this.slide];
			if (!slide) return;

			if (this.frame >= slide.frame) {
				this.handleSlide(slide);
			}
		}, 1e3 / (this.precision * this.project?.video?.framerate));

		this.registeredEventListeners = true;
	}

	loadVideo(base64Video: string) {
		this.video = base64Video;
		if (this.player) this.player.src = this.video;
		this.registerEventListeners();
	}

	loadSlides(timeline: timeline) {
		this.timeline = timeline;

		this.timeline[-1] = {
			id: '00000000-0000-0000-0000-000000000000',
			frame: 0,
			type: 'default',
			clickThroughBehaviour: 'ImmediatelySkip',
		};

		this.registerEventListeners();
	}

	skip() {
		var slide = this.timeline[this.slide - 1];
		if (slide.clickThroughBehaviour == 'ImmediatelySkip') this.jumpToSlide(slide);
	}

	next() {
		if (!this.registeredEventListeners) return;

		this.slide++;

		var slide = this.timeline[this.slide];
		var event = new CustomEvent('TimedVideoPlayerSlide', { detail: slide });
		this.dispatchEvent(event);

		if (!this.player.paused && this.frame < slide?.frame) {
			this.skip();
		}
	}

	previous() {
		if (!this.registeredEventListeners) return;

		this.slide = Math.max(this.slide - 1, -1);

		var slide = this.timeline[this.slide];
		if (!slide) return;

		var event = new CustomEvent('TimedVideoPlayerSlide', { detail: slide });
		this.dispatchEvent(event);

		this.jumpToSlide(slide);
	}
}

export default function Present() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);
	var [player, _setPlayer] = useState(new TimedVideoPlayer());
	var [project, _setProject] = useState(new Project());
	player.project = project;

	var controlType = project.settings?.controls?.ControlType;
	var [menu, setMenu] = useState(true);

	var Controls = {
		'FullScreen': FullScreenControls,
		'MenuBar': MenuBarControls,
	}[controlType] || (() => null);

	var [time, setTime] = useState('');

	useEffect(() => {
		setInterval(() => setTime(new Date().toLocaleTimeString()), 500);
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
		<Controls
			next={() => {
				player.next();
				player.player.play();
				rerender();
			}}
			previous={() => {
				player.previous();
				rerender();
			}}
			menu={() => setMenu(true)}
		/>
		<div className={'menu posabs a0 ' + (menu ? 'active ' : '')} id='menu'>
			<div
				className='background posabs a0'
				onClick={() => setMenu(false)}
			/>
			<div className='info sidebyside posabs h0 b0'>
				<div className='timetitle floatb'>
					<h3 className='time numbers nobr'>{time}</h3>
					<h1 className='title nobr'>{player.project?.name || '???'}</h1>
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
							id='prsprUpload'
							accept='.prspr'
							className='dispnone'
							onChange={event => {
								var file = event.target.files[0];
								if (!file) return;
								var reader = new FileReader();
								reader.addEventListener('load', async ev => {
									await project.openProject(ev.target.result as ArrayBuffer);

									player.loadSlides(project.timeline);
									player.loadVideo(arrayBufferToBase64(project.video.source, project.video.mimetype));

									rerender();
								});
								reader.readAsArrayBuffer(file);
							}}
						/>
						<Button
							variant='contained'
							color='default'
							children='Load .prspr'
							onClick={() => document.getElementById('prsprUpload').click()}
							startIcon={<DescriptionRoundedIcon />}
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
						slide {player.slide + 1}/{player.timeline?.length || 0}
					</h3>
				</div>
			</div>
		</div>
	</div>;
}
