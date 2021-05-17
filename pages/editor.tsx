import { CSSProperties, useEffect, useState } from 'react';
import create from 'zustand';
import { loopSlide } from '../timeline';
import { TimedVideoPlayer } from './present';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fab from '@material-ui/core/Fab';
import Slider from '@material-ui/core/Slider';
import Toolbar from '@material-ui/core/Toolbar';
import ZoomInRoundedIcon from '@material-ui/icons/ZoomInRounded';
import ZoomOutRoundedIcon from '@material-ui/icons/ZoomOutRounded';
import Icon from '@mdi/react';

import { PressureIcon, SlideKeyframe } from '../components/icons';
import Loop from '../components/loop';

import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { mdiCursorDefault } from '@mdi/js';

var getTimelineZoom = create(set => ({
	zoom: 0.2,
	changeZoom: (delta: number) => set((st: any) => ({ zoom: Math.min(1, Math.max(0, st.zoom + delta)) })),
	setZoom: (newValue: number) => set(() => ({ zoom: newValue })),
}));

function TimelineEditor(props: {
	player: TimedVideoPlayer;
}) {
	var keyframes = props.player?.timeline?.slides.map(slide =>
		<div className='frame posabs' style={{ '--frame': slide.frame.toString() } as CSSProperties}>
			<div className='keyframeWrapper posabs abscenterh'>
				{slide.type == 'loop'
					? <Loop length={slide.frame - (slide as loopSlide).beginFrame} />
					: <SlideKeyframe type={slide.type} />}
			</div>
		</div>
	);

	useEffect(() => {
		var canvas = document.getElementById('timeScaleCanvas') as HTMLCanvasElement;
		var ctx = canvas.getContext('2d');

		var mouseX = 0;
		var mouseY = 0;

		window.addEventListener('mousemove', e => {
			var rect = canvas.getBoundingClientRect();
			mouseX = e.clientX - rect.x;
			mouseY = e.clientY - rect.y;
		});

		var css = (varname: string) => getComputedStyle(document.body).getPropertyValue(varname).trim();
		var baseColor = css('--c100');
		var frameColor = css('--c250');
		var markerFrame = css('--c400');

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			var offset = document.querySelector('.timeline .timelineInner').scrollLeft;

			var d = true;
			var frameWidth = Number(
				getComputedStyle(document.querySelector('.timeline')).getPropertyValue('--zoom').trim(),
			);
			var a = 1;
			var ns = [300, 150, 120, 90, 60, 30, 30, 30, 20, 20, 20, 20, 20];
			var everyN = ns[Math.floor(frameWidth)];
			for (var x = -offset; x < canvas.width + offset; x += frameWidth) {
				ctx.fillStyle = baseColor;

				var rect = [Math.round(x + (frameWidth - 2) / 2), 28, 2, canvas.height];
				var drawFrame = false;
				if (frameWidth >= 3) {
					ctx.fillStyle = d ? baseColor : frameColor;
					rect = [x, 28, frameWidth, canvas.height];
					drawFrame = !d;
				}
				/* if (a * 2 % everyN == 0) { */
				/* 	ctx.fillStyle = frameColor; */
				/* 	drawFrame = true; */
				/* } */
				if (a % everyN == 0) {
					ctx.fillStyle = markerFrame;
					drawFrame = true;
				}

				if (drawFrame) ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);

				d = !d;
				a++;
			}

			requestAnimationFrame(draw);
		}
		draw();

		function onresize() {
			var size = document.querySelector('.timeline .timelineInner .keyframes');
			canvas.width = size.clientWidth;
			canvas.height = size.clientHeight;
		}
		onresize();
		window.addEventListener('resize', onresize);
	}, []);

	return <>
		<canvas className='timeScale posabs a0' id='timeScaleCanvas' />
		<div className='timelineInner posabs a0'>
			<div className='scrubber posabs v0'>
				<svg
					width='20'
					height='28'
					viewBox='0 0 20 28'
					xmlns='http://www.w3.org/2000/svg'
					className='head posabs t0 abscenterh'
				>
					<path
						d='M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V17.3431C20 18.404 19.5786 19.4214 18.8284 20.1716L11 28H9L1.17157 20.1716C0.421426 19.4214 0 18.404 0 17.3431V4Z'
					/>
				</svg>
				<div className='needle posabs a0' />
				<div className='frameOverlay posabs v0' />
			</div>
			<div className='keyframes'>{keyframes}</div>
		</div>
	</>;
}

export default function Index() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);
	var [player, setPlayer] = useState(new TimedVideoPlayer());

	var timelineZoom = getTimelineZoom((st: any) => st.zoom);
	var setTimelineZoom = getTimelineZoom((st: any) => st.setZoom);

	useEffect(() => {
		var videoEL = document.getElementById('player') as HTMLVideoElement;
		player.registerPlayer(videoEL);
	}, []);

	var changeZoom = getTimelineZoom(st => (st as any).changeZoom);
	useEffect(() => {
		document.querySelector('.timeline').addEventListener('wheel', (e: WheelEvent) => {
			if (!e.ctrlKey && !e.altKey) return;
			e.preventDefault();

			changeZoom(-e.deltaY / 1000);
		}, { passive: false });
	}, []);

	return <>
		<div className='appGrid posabs a0'>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<PressureIcon />
					<h1>pressure</h1>
				</Toolbar>
			</AppBar>
			<div className='settings'>
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
					onClick={() => document.getElementById('vidUpload').click()}
				/>
				<Button
					variant='contained'
					color='default'
					children='Load json'
					onClick={() => document.getElementById('jsonUpload').click()}
				/>
			</div>
			<div className='viewer'>
				<div className='player posrel'>
					<div className='outer posabs abscenter'>
						<video id='player' className='fullwidth' />
					</div>
				</div>
				<div className='controls'>
					<div className='posabs abscenter'>
						<Fab size='small' children={<SkipPreviousRoundedIcon />} />
						<Fab className='playPause' size='medium' children={<PauseRoundedIcon />} />
						<Fab size='small' children={<NavigateBeforeRoundedIcon />} />
						<Fab size='small' children={<NavigateNextRoundedIcon />} />
					</div>
					<div className='posabs abscenterv r0'>
						<Fab size='small' children={<FullscreenRoundedIcon />} />
					</div>
				</div>
			</div>
			<div className='tools'>
				<div className='time posrel'>
					<span className='framerate numbers posabs l0 t0'>@{player.framerate}fps</span>
					<h2 className='timecode numbers posabs r0 t0'>00:00:00:00f</h2>
				</div>
				<ButtonGroup color='primary' aria-label='outlined primary button group'>
					<Button children={<Icon path={mdiCursorDefault} size={1} />} />
					<Button children={<SlideKeyframe type='default' />} />
					<Button children={<SlideKeyframe type='delay' />} />
					<Button children={<SlideKeyframe type='speedChange' />} />
					<Button>
						<div className='loopStartEnd'>
							<span className='posabs start'>
								<SlideKeyframe type='loop' />
							</span>
							<span className='posabs end'>
								<SlideKeyframe type='loop' loopEnd />
							</span>
						</div>
					</Button>
				</ButtonGroup>
				<div className='zoom'>
					<ZoomOutRoundedIcon />
					<div className='spacing'>
						<Slider
							value={timelineZoom}
							onChange={(event: any, newValue: number | number[]) => {
								setTimelineZoom(newValue as number);
							}}
							min={0}
							step={0.00000001}
							max={1}
							aria-labelledby='continuous-slider'
						/>
					</div>
					<ZoomInRoundedIcon />
				</div>
			</div>
			<div
				className='timeline posrel'
				style={{ '--zoom': (12 - 0.5) * timelineZoom ** (1 / 0.4) + 0.5 } as CSSProperties}
			>
				<TimelineEditor
					player={player}
				/>
			</div>
		</div>
	</>;
}
