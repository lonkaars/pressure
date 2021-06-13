import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import create from 'zustand';
import { anySlide, loopSlide, slide, slideTypes, toolToSlide } from '../timeline';
import { TimedVideoPlayer } from './present';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Slider from '@material-ui/core/Slider';
import Toolbar from '@material-ui/core/Toolbar';
import ZoomInRoundedIcon from '@material-ui/icons/ZoomInRounded';
import ZoomOutRoundedIcon from '@material-ui/icons/ZoomOutRounded';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Icon from '@mdi/react';

import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { mdiCursorDefault } from '@mdi/js';
import { PressureIcon, SlideKeyframe } from '../components/icons';
import PlaySkipIconAni from '../components/play-skip';
import Selection from '../components/selection';

var keyframeInAnimations: { [key: string]: { x: number; y: number; }; } = {};

var player = new TimedVideoPlayer();
var useWorkingTimeline = create((set, get) => ({
	timeline: [],
	setTimeline: (newTimeline: anySlide[]) => set(() => ({ timeline: newTimeline })),
	refreshLiveTimeline: () => {
		player.timeline.slides = Array(...((get() as any).timeline));
		player.timeline.slides.sort((a: anySlide, b: anySlide) => a.frame - b.frame);
		player.timeline.slides[-1] = { // TODO: dry
			id: '00000000-0000-0000-0000-000000000000',
			frame: 0,
			type: 'default',
			clickThroughBehaviour: 'ImmediatelySkip',
		};
	},
}));

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

function TimelineKeyframe(props: {
	slide: slide;
}) {
	var workingTimeline = useWorkingTimeline((st: any) => st.timeline);
	var setWorkingTimeline = useWorkingTimeline((st: any) => st.setTimeline);
	var updateTimeline = useWorkingTimeline((st: any) => st.refreshLiveTimeline);

	function modifySlide(newProps: Partial<anySlide>) {
		var slide = workingTimeline.find((s: anySlide) => s.id == props.slide.id);
		slide = Object.assign(slide, newProps);
		setWorkingTimeline(workingTimeline);
	}

	var dragRef = useRef(null);
	var loopStartRef = useRef(null);
	var loopEndRef = useRef(null);

	var [firstRender, setFirstRender] = useState(true);

	var [spring, api] = useSpring(() => ({
		frame: props.slide.frame,
		begin: (props.slide as loopSlide).beginFrame || 0,
		y: 44,
		config: { mass: 0.5, tension: 500, friction: 20 },
	}));

	useEffect(() => {
		setFirstRender(false);
		var beginAnimation = keyframeInAnimations[props.slide.id];
		if (!beginAnimation) return;

		api.set({ frame: beginAnimation.x, y: beginAnimation.y - 16 });
		api.start({ frame: Math.round(beginAnimation.x), y: 44 });

		delete keyframeInAnimations[props.slide.id];
	}, []);

	var timelineZoom = getTimelineZoom((st: any) => st.zoom);

	// drag keyframe
	var [startOffset, setStartOffset] = useState(0);
	var [endOffset, setEndOffset] = useState(0);
	useDrag(({ xy: [x, _y], first }) => {
		var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240, timelineZoom)) - 1);

		if (props.slide.type == 'loop') {
			if (first) {
				var startFrame = spring.begin.toJSON();
				var endFrame = spring.frame.toJSON();
				var grabFrameOffset = frame;

				setStartOffset(startFrame - grabFrameOffset);
				startOffset = startFrame - grabFrameOffset;

				setEndOffset(endFrame - grabFrameOffset);
				endOffset = endFrame - grabFrameOffset;
			}
			api.start({ begin: frame + startOffset, frame: frame + endOffset });

			modifySlide({ frame: frame + endOffset });
			modifySlide({ beginFrame: frame + startOffset });
		} else {
			api.start({ frame });

			modifySlide({ frame });
		}
	}, { domTarget: dragRef, eventOptions: { passive: false } });

	if (props.slide.type == 'loop') {
		// loop start
		useDrag(({ xy: [x, _y] }) => {
			var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240, timelineZoom)) - 1);

			api.start({ begin: frame });

			modifySlide({ beginFrame: frame });
		}, { domTarget: loopStartRef, eventOptions: { passive: false } });

		// loop end
		useDrag(({ xy: [x, _y] }) => {
			var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240, timelineZoom)) - 1);

			api.start({ frame });

			modifySlide({ frame });
		}, { domTarget: loopEndRef, eventOptions: { passive: false } });
	}

	var mouseUpListener = useRef(null);
	useDrag(({ last }) => {
		if (!last) return;
		updateTimeline();
	}, { domTarget: mouseUpListener, eventOptions: { passive: false } });

	return <animated.div
		className='frame posabs'
		style={{
			'--frame': spring.frame,
			opacity: firstRender ? 0 : 1,
		} as CSSProperties}
		id={'slide-' + props.slide.id}
		ref={mouseUpListener}
	>
		<div className='keyframeWrapper posabs abscenterh' style={{ top: spring.y.toJSON() }}>
			{props.slide.type == 'loop'
				? <div
					style={{ '--begin': spring.begin.toJSON() } as CSSProperties}
					className='loop'
				>
					<span className='dispinbl posabs l0 start' ref={loopStartRef}>
						<SlideKeyframe type='loop' />
					</span>
					<div className='connector dispinbl' ref={dragRef} />
					<span className='dispinbl posabs r0 end' ref={loopEndRef}>
						<SlideKeyframe type='loop' loopEnd />
					</span>
				</div>
				: <span ref={dragRef}>
					<SlideKeyframe type={props.slide.type} />
				</span>}
		</div>
	</animated.div>;
}

function TimelineEditor(props: {
	player: TimedVideoPlayer;
	selectedTool: string;
}) {
	var timelineZoom = getTimelineZoom((st: any) => st.zoom);

	var timelineLabels = useTimelineLabels((st: any) => st.labels);
	var setTimelineLabels = useTimelineLabels((st: any) => st.setLabels);

	var workingTimeline = useWorkingTimeline((st: any) => st.timeline);
	var setWorkingTimeline = useWorkingTimeline((st: any) => st.setTimeline);

	var setFrame = useFrame((st: any) => st.setFrame);

	useEffect(() => {
		props.player.addEventListener('TimedVideoPlayerOnFrame', (event: CustomEvent) => {
			setFrame(event.detail);
			scrubberSpring.start({ frame: event.detail });
		});
	}, []);

	useEffect(() => {
		props.player.addEventListener('TimedVideoPlayerSlide', (event: CustomEvent) => {
			document.querySelectorAll('.keyframes .frame').forEach(el => {
				el.classList.remove('current');
				if (event.detail && el.id == 'slide-' + (event.detail as slide).id) {
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
					ctx.fillRect(Math.round(rect[0]), Math.round(rect[1]), Math.round(rect[2]), Math.round(rect[3]));

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

	var [ghost, ghostApi] = useSpring(() => ({
		x: 0,
		y: 0,
		config: { mass: 0.5, tension: 500, friction: 20 },
	}));
	useEffect(() => {
		document.querySelector('.timeline').addEventListener('mousemove', (e: MouseEvent) => {
			var rect = document.querySelector('.timeline').getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;
			ghostApi.start({ x, y });
		});
	}, []);

	var [selectionPos, selectionPosAPI] = useSpring(() => ({
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		config: { mass: 0.5, tension: 500, friction: 20 },
	}));
	var selectionRef = useRef(null);
	useDrag(({ xy: [x, y], initial: [bx, by] }) => {
		if (props.selectedTool != 'cursor') return;
		// var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240, timelineZoom)) - 1);
		var timelineInner = document.querySelector('.timeline .timelineInner');
		var timelineRects = timelineInner.getBoundingClientRect();
		var tx = x - timelineRects.x + timelineInner.scrollLeft;
		var ty = y - timelineRects.y;
		var ix = bx - timelineRects.x + timelineInner.scrollLeft;
		var iy = by - timelineRects.y;

		var sx = tx - ix;
		var sy = ty - iy;

		var x1 = ix + Math.min(0, sx);
		var y1 = iy + Math.min(0, sy);
		var x2 = x1 + Math.abs(sx);
		var y2 = y1 + Math.abs(sy);
		selectionPosAPI.start({ x1, y1, x2, y2 });
	}, { domTarget: selectionRef, eventOptions: { passive: false } });

	return <>
		<canvas
			className='timeScale posabs a0'
			id='timeScaleCanvas'
			onClick={event => {
				// place new keyframe
				var offset = -4; // keyframe offset
				var x = event.clientX - 240 + offset;
				var frame = getFrameAtOffset(x, timelineZoom) - 0.5;
				var slide = new toolToSlide[props.selectedTool](frame);
				workingTimeline.push(slide);
				setWorkingTimeline(workingTimeline);
				keyframeInAnimations[slide.id] = {
					x: frame,
					y: event.clientY - window.innerHeight + 210,
				};
			}}
		/>
		<div className='labels' children={timelineLabels} />
		<div className='scrubberJumpArea posabs h0 t0' ref={scrubberDragRef} />
		<div className={'timelineInner posabs a0' + (props.selectedTool != 'cursor' ? ' blur' : '')}>
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
				<div className='selectionarea posabs v0' ref={selectionRef} />
				{workingTimeline.map((slide: anySlide) => <TimelineKeyframe slide={slide} />)}
				<div
					id='selection'
					className='posabs dispinbl'
					style={{ left: selectionPos.x1.toJSON() - 6, top: selectionPos.y1.toJSON() - 6 }}
					children={<Selection
						width={selectionPos.x2.toJSON() - selectionPos.x1.toJSON() + 12}
						height={selectionPos.y2.toJSON() - selectionPos.y1.toJSON() + 12}
					/>}
				/>
			</div>
		</div>
		<div className={'ghostArea posabs a0' + (props.selectedTool != 'cursor' ? ' active' : '')}>
			<animated.div
				id='ghost'
				className='posabs dispinbl'
				style={{
					top: ghost.y,
					left: ghost.x,
				}}
				children={<SlideKeyframe type={props.selectedTool as slideTypes} ghost />}
			/>
		</div>
	</>;
}

export default function Index() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);

	var setWorkingTimeline = useWorkingTimeline((st: any) => st.setTimeline);

	var timelineZoom = getTimelineZoom((st: any) => st.zoom);
	var setTimelineZoom = getTimelineZoom((st: any) => st.setZoom);

	var frame = useFrame((st: any) => st.currentFrame);

	var [tool, setTool] = useState('cursor');

	var [playing, setPlaying] = useState(false);

	var mouseX = 0;

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

							player.player.addEventListener('play', () => setPlaying(true));
							player.player.addEventListener('pause', () => setPlaying(false));
						});
						reader.readAsDataURL(file);
					}}
				/>
				<Button
					variant='contained'
					color='default'
					children='Load video'
					onClick={() => document.getElementById('vidUpload').click()}
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
							setWorkingTimeline(player.timeline.slides);
							rerender();
						});
						reader.readAsText(file);
					}}
				/>
				<Button
					variant='contained'
					color='default'
					children='Load json'
					onClick={() => document.getElementById('jsonUpload').click()}
				/>
				<Button
					variant='contained'
					color='default'
					children='Download json'
					onClick={() => {
						var timeline = Object({ ...(player.timeline) });
						var data = JSON.stringify(timeline);
						var blob = new Blob([data], { type: 'application/json' });
						var a = document.createElement('a');
						a.href = URL.createObjectURL(blob);
						a.download = player.timeline.name
							.toLowerCase()
							.replace(/\s/g, '-');
						a.click();
					}}
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
						<Fab
							size='small'
							children={<SkipPreviousRoundedIcon />}
							onClick={() => {
								player.slide = 0;
								player.previous();
							}}
						/>
						<Fab
							className='playPause'
							size='medium'
							onClick={() => {
								player.next();
								player.player.play();
							}}
							children={<PlaySkipIconAni />}
							style={{ '--ani-state': playing ? 'skip' : 'play' } as CSSProperties}
						/>
						<Fab size='small' children={<NavigateBeforeRoundedIcon />} onClick={() => player.previous()} />
						<Fab
							size='small'
							children={<NavigateNextRoundedIcon />}
							onClick={() => {
								player.next(); // TODO: fix jank here
								player.next();
								player.previous();
							}}
						/>
					</div>
					<div className='posabs abscenterv r0'>
						<Fab
							size='small'
							children={<FullscreenRoundedIcon />}
							onClick={() => document.body.requestFullscreen()}
						/>
					</div>
				</div>
			</div>
			<div className='tools'>
				<div className='time posrel'>
					<span className='framerate numbers posabs l0 t0'>@{player.framerate}fps</span>
					<h2 className='timecode numbers posabs r0 t0'>{player.frameToTimestampString(frame, false)}</h2>
				</div>
				<ToggleButtonGroup
					color='primary'
					aria-label='outlined primary button group'
					value={tool}
					exclusive
					onChange={(_event: any, newTool: string | null) => {
						if (newTool === null) return;
						setTool(newTool);
					}}
				>
					<ToggleButton value='cursor' children={<Icon path={mdiCursorDefault} size={1} />} />
					<ToggleButton value='default' children={<SlideKeyframe type='default' />} />
					<ToggleButton value='delay' children={<SlideKeyframe type='delay' />} />
					<ToggleButton value='speedChange' children={<SlideKeyframe type='speedChange' />} />
					<ToggleButton value='loop'>
						<div className='loopStartEnd'>
							<span className='posabs start' children={<SlideKeyframe type='loop' />} />
							<span className='posabs end' children={<SlideKeyframe type='loop' loopEnd />} />
						</div>
					</ToggleButton>
				</ToggleButtonGroup>
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
					selectedTool={tool}
				/>
			</div>
		</div>
	</>;
}
