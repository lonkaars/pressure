import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
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
	zoom: 0.687077725615,
	setZoom: (newValue: number) => set(() => ({ zoom: newValue })),
}));

var zoomToPx = (zoom: number) => (12 - 0.5) * zoom ** (1 / 0.4) + 0.5;

function getFrameAtOffset(offset: number, timelineZoom: number) {
	var timeline = document.querySelector('.timeline .timelineInner');
	var currentOffset = timeline.scrollLeft;
	var frame = (offset + currentOffset) / zoomToPx(timelineZoom);
	return frame;
}

var useTimelineLabels = create(set => ({
	labels: [],
	setLabels: (newLabels: Array<ReactNode>) => set(() => ({ labels: newLabels })),
}));

var useFrame = create(set => ({
	currentFrame: 0,
	setFrame: (newFrame: number) => set(() => ({ currentFrame: newFrame })),
}));

function TimelineEditor(props: {
	player: TimedVideoPlayer;
}) {
	var keyframes = props.player?.timeline?.slides.map((slide, index) =>
		<div className='frame posabs' style={{ '--frame': slide.frame.toString() } as CSSProperties}>
			<div className={'keyframeWrapper posabs abscenterh keyframe-index-' + index}>
				{slide.type == 'loop'
					? <Loop length={slide.frame - (slide as loopSlide).beginFrame} />
					: <SlideKeyframe type={slide.type} />}
			</div>
		</div>
	);

	var timelineLabels = useTimelineLabels((st: any) => st.labels);
	var setTimelineLabels = useTimelineLabels((st: any) => st.setLabels);

	// var frame = useFrame((st: any) => st.currentFrame);
	var setFrame = useFrame((st: any) => st.setFrame);

	var timelineZoom = getTimelineZoom((st: any) => st.zoom);

	useEffect(() => {
		props.player.addEventListener('TimedVideoPlayerOnFrame', (event: CustomEvent) => {
			setFrame(event.detail);
			scrubberSpring.start({ frame: event.detail });
		});
	}, []);

	useEffect(() => {
		props.player.addEventListener('TimedVideoPlayerSlide', (event: CustomEvent) => {
			document.querySelectorAll('.keyframes .keyframeWrapper').forEach(el => {
				el.classList.remove('current');
				if (el.classList.contains(`keyframe-index-${event.detail}`)) {
					el.classList.add('current');
				}
			});
		});
	}, []);

	// timeline canvas stuff
	useEffect(() => {
		var canvas = document.getElementById('timeScaleCanvas') as HTMLCanvasElement;
		var ctx = canvas.getContext('2d');

		var css = (varname: string) => getComputedStyle(document.body).getPropertyValue(varname).trim();
		var baseColor = css('--c100');
		var frameColor = css('--c250');
		var markerFrame = css('--c400');

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			var labels: Array<ReactNode> = [];

			var offset = document.querySelector('.timeline .timelineInner').scrollLeft;

			var frameWidth = Number(
				getComputedStyle(document.querySelector('.timeline')).getPropertyValue('--zoom').trim(),
			);

			var d = true;
			var a = 0;
			var ns = [300, 150, 120, 90, 60, 30, 30, 30, 15, 15, 10, 10, 10];
			var everyN = ns[Math.floor(frameWidth)];
			for (var x = -offset; x < canvas.width + offset; x += frameWidth) {
				ctx.fillStyle = baseColor;

				var rect = [Math.round(x + (frameWidth - 2) / 2), 28, 2, canvas.height];
				var drawFrame = false;
				var marker = false;
				if (frameWidth >= 6) {
					ctx.fillStyle = d ? baseColor : frameColor;
					rect = [x, 28, frameWidth, canvas.height];
					drawFrame = !d;
				}
				if (a % everyN == 0) {
					ctx.fillStyle = markerFrame;
					drawFrame = true;
					marker = true;
				}

				if (drawFrame) {
					ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);

					if (marker) {
						var frame = Math.round(x / frameWidth + offset / frameWidth + 1);
						labels.push(
							<span
								className='label numbers posabs nosel'
								style={{
									left: Math.round(rect[0] + frameWidth / 2),
									top: rect[1],
								}}
								children={props.player.frameToTimestampString(frame - 1)}
							/>,
						);
					}
				}

				d = !d;
				a++;
			}

			setTimelineLabels(labels);

			requestAnimationFrame(draw);
		}
		draw();

		function onresize() {
			var size = document.querySelector('.timeline .timelineInner');
			canvas.width = size.clientWidth;
			canvas.height = size.clientHeight;
		}
		onresize();
		window.addEventListener('resize', onresize);
	}, []);

	var scrubberDragRef = useRef(null);

	var [scrubberPos, scrubberSpring] = useSpring(
		() => ({
			frame: 0,
			config: { mass: 0.5, tension: 500, friction: 20 },
		}),
	);

	useDrag(({ xy: [x, _y] }) => {
		var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240, timelineZoom)) - 1);
		setFrame(frame);
		scrubberSpring.start({ frame });
		if (props.player.player) {
			var player = props.player.player;
			player.currentTime = props.player.frameToTimestamp(frame + 1);
		}
	}, { domTarget: scrubberDragRef, eventOptions: { passive: false } });

	return <>
		<canvas className='timeScale posabs a0' id='timeScaleCanvas' />
		<div className='labels' children={timelineLabels} />
		<div className='scrubberJumpArea posabs h0 t0' ref={scrubberDragRef} />
		<div className='timelineInner posabs a0'>
			<animated.div
				className='scrubber posabs v0'
				style={{ '--frame': scrubberPos.frame } as CSSProperties}
			>
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
			</animated.div>
			<div
				className='keyframes'
				style={{ '--total-frames': props.player?.timeline?.framecount.toString() } as CSSProperties}
			>
				{keyframes}
			</div>
		</div>
	</>;
}

export default function Index() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);
	var [player, _setPlayer] = useState(new TimedVideoPlayer());

	var timelineZoom = getTimelineZoom((st: any) => st.zoom);
	var setTimelineZoom = getTimelineZoom((st: any) => st.setZoom);

	var frame = useFrame((st: any) => st.currentFrame);

	var mouseX = 0;
	// var mouseY = 0;

	useEffect(() => {
		var videoEL = document.getElementById('player') as HTMLVideoElement;
		player.registerPlayer(videoEL);
	}, []);

	function zoomAroundPoint(newZoom: number, pivot: number) {
		var timeline = document.querySelector('.timeline .timelineInner');
		var frame = getFrameAtOffset(pivot, timelineZoom);
		var newOffset = (frame * zoomToPx(newZoom)) - pivot;

		timeline.scrollLeft = newOffset;
		setTimelineZoom(newZoom);
		timelineZoom = newZoom;
	}

	useEffect(() => {
		document.querySelector('.timeline').addEventListener('wheel', (e: WheelEvent) => {
			if (!e.ctrlKey && !e.altKey) return;
			e.preventDefault();

			var newZoom = Math.min(1, Math.max(0, timelineZoom + (-e.deltaY / 1000)));
			zoomAroundPoint(newZoom, mouseX);
		}, { passive: false });
	}, []);

	useEffect(() => {
		var canvas = document.querySelector('.timeline .timeScale');
		window.addEventListener('mousemove', e => {
			var rect = canvas.getBoundingClientRect();
			mouseX = e.clientX - rect.x;
			// mouseY = e.clientY - rect.y;
		});
	}, []);

	useEffect(() => {
		var preventDefault = (e: Event) => e.preventDefault();
		document.addEventListener('gesturestart', preventDefault);
		document.addEventListener('gesturechange', preventDefault);
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
						<Fab
							className='playPause'
							size='medium'
							children={<PauseRoundedIcon />}
							onClick={() => player.next()}
						/>
						<Fab size='small' children={<NavigateBeforeRoundedIcon />} onClick={() => player.previous()} />
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
					<h2 className='timecode numbers posabs r0 t0'>{player.frameToTimestampString(frame, false)}</h2>
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
							onChange={(_event: any, newValue: number | number[]) => {
								var center = document.querySelector('.timeline .timelineInner').clientWidth / 2;
								zoomAroundPoint(newValue as number, center);
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
				style={{ '--zoom': zoomToPx(timelineZoom) } as CSSProperties}
			>
				<TimelineEditor
					player={player}
				/>
			</div>
		</div>
	</>;
}
