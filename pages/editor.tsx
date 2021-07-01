import { createState, Downgraded, none, State, useHookstate } from '@hookstate/core';
import { CSSProperties, ReactNode, Ref, useEffect, useRef, useState } from 'react';
import { animated, SpringRef, SpringValues, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { useMousetrap } from 'use-mousetrap';
import { v4 as uuid } from 'uuid';

import FadeThroughTransition from '../components/fadethrough';
import {
	FullScreenControlsRoundedIcon,
	MenuBarControlsRoundedIcon,
	PressureIcon,
	SlideKeyframe,
} from '../components/icons';
import KeybindSelector from '../components/keybindselector';
import PlaySkipIconAni from '../components/play-skip';
import Selection from '../components/selection';
import timeline, {
	anySlide,
	loopBeginSlide,
	loopSlide,
	presentationSettings,
	slide,
	slideTypes,
	toolToSlide,
} from '../timeline';
import { TimedVideoPlayer } from './present';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import ZoomInRoundedIcon from '@material-ui/icons/ZoomInRounded';
import ZoomOutRoundedIcon from '@material-ui/icons/ZoomOutRounded';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Icon from '@mdi/react';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { mdiCursorDefault } from '@mdi/js';

import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import VideoLabelRoundedIcon from '@material-ui/icons/VideoLabelRounded';

var keyframeInAnimations: { [key: string]: { x: number; y: number; }; } = {};
var slideAPIs: { [key: string]: any; }[] = [];

var player = new TimedVideoPlayer();

interface globalState {
	timeline: {
		playing: boolean;
		frame: number;
		labels: ReactNode[];
		zoom: number;
		workingTimeline: anySlide[];
		tool: string;
	};
	selection: {
		slides: anySlide[];
		active: boolean;
		placed: boolean;
		hidden: boolean;
		type: {
			left: slideTypes | null;
			right: slideTypes | null;
		};
	};
	dialog: {
		projectSettings: boolean;
	};
	settings: {
		node: ReactNode;
		name: string;
	};
	ready: {
		timeline: boolean;
		video: {
			available: boolean;
			playable: boolean;
		};
	};
	update: {
		refreshLiveTimeline: () => void;
	};
}

var global = createState<globalState>({
	timeline: {
		playing: false,
		frame: 0,
		labels: [],
		zoom: 0.687077725616,
		workingTimeline: [],
		tool: 'cursor',
	},
	selection: {
		slides: [],
		active: false,
		placed: false,
		hidden: true,
		type: {
			left: null,
			right: null,
		},
	},
	dialog: {
		projectSettings: false,
	},
	ready: {
		timeline: false,
		video: {
			available: false,
			playable: false,
		},
	},
	settings: {
		node: <DefaultSettings />,
		name: 'DefaultSettings',
	},
	update: {
		refreshLiveTimeline: () => {
			player.timeline.slides = Array(...(global.timeline.workingTimeline.value));
			player.timeline.slides = player.timeline.slides.filter(slide => slide != null);
			player.timeline.slides.sort((a, b) => a.frame - b.frame);
			player.timeline.slides[-1] = { // TODO: dry
				id: '00000000-0000-0000-0000-000000000000',
				frame: 0,
				type: 'default',
				clickThroughBehaviour: 'ImmediatelySkip',
			};
			project.timeline.slides.set(player.timeline.slides);
			player.timeline = project.timeline.attach(Downgraded).value;
		},
	},
});

interface project {
	timeline: timeline;
}

var project = createState<project>({
	timeline: {
		name: '',
		slides: [],
		settings: {
			controlType: 'FullScreen',
		},
		framerate: 0,
		framecount: 0,
	},
});

var settings = {
	'default': {
		node: <DefaultSettings />,
		name: 'DefaultSettings',
	},
	'slide': {
		node: <SlideSettings />,
		name: 'SlideSettings',
	},
};
function setSetting(name: keyof typeof settings) {
	var setting = settings[name];
	if (global.settings.name.value == setting.name) return;
	global.settings.set(setting);
}

interface selectionPos {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	center: number;
	startingFrame: number;
	frameWidth: number;
	startOffset: number;
	widthOffset: number;
	visibility: number;
}
var selectionPos: SpringValues<selectionPos>,
	selectionPosAPI: SpringRef<selectionPos>;
function select(slides: anySlide[]) {
	if (slides.length == 0) {
		global.selection.set({
			slides: [],
			active: false,
			placed: false,
			hidden: true,
			type: {
				left: null,
				right: null,
			},
		});
		setSetting('default');
		selectionPosAPI({ visibility: 0 });
	} else {
		var left = slides[0];
		var right = slides[slides.length - 1];

		var [startOffset, widthOffset] = calculateSelectionOffsets(left.type, right.type);

		selectionPosAPI[global.selection.hidden.value ? 'set' : 'start']({
			y1: 50,
			y2: 62,
			startingFrame: left.frame,
			frameWidth: right.frame - left.frame,
			center: 0.5,
			startOffset,
			widthOffset,
		});
		global.selection.set({
			slides,
			active: false,
			placed: true,
			hidden: false,
			type: {
				left: left.type,
				right: right.type,
			},
		});
		setSetting('slide');
		selectionPosAPI({ visibility: 1 });
	}
}

var zoomToPx = (zoom: number) => (12 - 0.5) * zoom ** (1 / 0.4) + 0.5;

function getFrameAtOffset(offset: number) {
	var timeline = document.querySelector('.timeline .timelineInner');
	var currentOffset = timeline.scrollLeft;
	var frame = (offset + currentOffset) / zoomToPx(global.timeline.zoom.value);
	return frame;
}

function getOffsetAtFrame(frame: number) {
	var timeline = document.querySelector('.timeline .timelineInner');
	var currentOffset = timeline.scrollLeft;
	var offset = zoomToPx(global.timeline.zoom.value) * frame - currentOffset;
	return offset;
}

function calculateSelectionOffsets(left: slideTypes, right: slideTypes) {
	var offsets = {
		default: { left: -6, right: 6 },
		loop: { left: -3, right: 1 },
		loopBegin: { left: -1, right: 3 },
		delay: { left: -6, right: 6 },
		speedChange: { left: -6, right: 6 },
	};

	var offsetLeft = offsets[left].left;
	var offsetWidth = offsets[right].right - offsetLeft;

	return [offsetLeft, offsetWidth];
}

function TimelineKeyframe(props: {
	slide: anySlide;
}) {
	function modifySlide(newProps: Partial<anySlide>) {
		var slide = global.timeline.workingTimeline.find(s => s.value.id == props.slide.id);
		slide.set(Object.assign({}, slide.value, newProps));
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

	slideAPIs[props.slide.id] = api;

	useEffect(() => {
		setFirstRender(false);
		var beginAnimation = keyframeInAnimations[props.slide.id];
		if (!beginAnimation) return;
		if (props.slide.type == 'loop') return;

		api.set({ frame: beginAnimation.x, y: beginAnimation.y - 16 });
		api.start({ frame: Math.round(beginAnimation.x), y: 44 });

		delete keyframeInAnimations[props.slide.id];
	}, []);

	// drag keyframe
	var [startOffset, setStartOffset] = useState(0);
	var [endOffset, setEndOffset] = useState(0);
	useDrag(({ xy: [x, _y], first, intentional }) => {
		var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240)) - 1);

		if (props.slide.type == 'loop') {
			if (intentional) {
				if (first) {
					var startFrame = spring.begin.get();
					var endFrame = spring.frame.get();
					var grabFrameOffset = frame;

					setStartOffset(startFrame - grabFrameOffset);
					startOffset = startFrame - grabFrameOffset;

					setEndOffset(endFrame - grabFrameOffset);
					endOffset = endFrame - grabFrameOffset;
				}
				api.start({ begin: frame + startOffset, frame: frame + endOffset });

				modifySlide({ frame: frame + endOffset });
				modifySlide({ beginFrame: frame + startOffset });
			}
			var end = props.slide;
			var begin = new loopBeginSlide(end as loopSlide);
			select([begin, end]);
		} else {
			if (intentional) {
				api.start({ frame });
				modifySlide({ frame });
			}
			select([props.slide]);
		}
	}, { domTarget: dragRef, eventOptions: { passive: false }, threshold: 10, triggerAllEvents: true });

	if (props.slide.type == 'loop') {
		// loop start
		useDrag(({ xy: [x, _y], intentional }) => {
			if (intentional) {
				var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240)) - 1);
				api.start({ begin: frame });
				modifySlide({ beginFrame: frame });
			}
			select([new loopBeginSlide(props.slide as loopSlide)]);
		}, { domTarget: loopStartRef, eventOptions: { passive: false }, threshold: 10, triggerAllEvents: true });

		// loop end
		useDrag(({ xy: [x, _y], intentional }) => {
			if (intentional) {
				var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240)) - 1);
				api.start({ frame });
				modifySlide({ frame });
			}
			select([props.slide]);
		}, { domTarget: loopEndRef, eventOptions: { passive: false }, threshold: 10, triggerAllEvents: true });
	}

	var mouseUpListener = useRef(null);
	useDrag(({ last }) => {
		if (!last) return;
		global.update.refreshLiveTimeline.value();
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
		<animated.div className='keyframeWrapper posabs abscenterh' style={{ top: spring.y }}>
			{props.slide.type == 'loop'
				? <animated.div
					style={{ '--begin': spring.begin } as CSSProperties}
					className='loop'
				>
					<span className='dispinbl posabs l0 start' ref={loopStartRef}>
						<SlideKeyframe type='loop' />
					</span>
					<div className='connector dispinbl' ref={dragRef} />
					<span className='dispinbl posabs r0 end' ref={loopEndRef}>
						<SlideKeyframe type='loop' loopEnd />
					</span>
				</animated.div>
				: <span ref={dragRef}>
					<SlideKeyframe type={props.slide.type} />
				</span>}
		</animated.div>
	</animated.div>;
}

function TimelineLabels() {
	var labels = useHookstate(global).timeline.labels;
	return <div className='labels' children={labels.attach(Downgraded).get()} />;
}

function TimelineSelection(props: { selectionDragArea: Ref<ReactNode>; }) {
	var selection = useHookstate(global).selection;

	[selectionPos, selectionPosAPI] = useSpring(() => ({
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
		center: 0,
		startingFrame: 0,
		frameWidth: 0,
		startOffset: 0,
		widthOffset: 0,
		visibility: 0,
		config: { mass: 0.5, tension: 500, friction: 20 },
	}));

	var selectionRef = useRef(null);
	// drag on selection
	useDrag(({ movement: [x, _y], last }) => {
		if (!global.selection.placed.value) return;
		if (global.selection.slides.value.length < 1) return;
		var frameOffset = Math.round(x / zoomToPx(global.timeline.zoom.value));
		global.selection.slides.forEach(slide => {
			var api = slideAPIs[slide.value.id];
			switch (slide.value.type as slideTypes | 'loopBegin') {
				case 'loopBegin': {
					if (!api) break;
					var loop = global.timeline.workingTimeline.value.find(s => s.id == slide.value.id) as loopSlide;
					var begin = loop.beginFrame + frameOffset;
					api.start({ begin });

					if (last) {
						(global.timeline.workingTimeline.find(s => s.value.id == slide.value.id) as State<loopSlide>)
							.beginFrame.set(begin);
						global.update.refreshLiveTimeline.value();
					}

					break;
				}
				default: {
					if (!api) break;
					var frame = slide.value.frame + frameOffset;
					api.start({ frame });

					if (last) {
						global.timeline.workingTimeline.find(s => s.value.id == slide.value.id).frame.set(frame);
						global.update.refreshLiveTimeline.value();
					}
				}
			}
			if (last) return;
			var selectionFrame = global.selection.slides[0].frame.value;
			selectionPosAPI.start({ startingFrame: selectionFrame + frameOffset });
		});
	}, { domTarget: selectionRef, eventOptions: { passive: false } });

	useDrag(({ xy: [x, y], initial: [bx, by], first, last, movement: [ox, oy] }) => {
		if (global.timeline.tool.value != 'cursor') return;
		var minDistance = 5; // minimal drag distance in pixels to register selection
		var distanceTraveled = Math.sqrt(ox ** 2 + oy ** 2);

		if (global.selection.hidden.value && distanceTraveled > minDistance) {
			global.selection.hidden.set(false);
			selectionPosAPI.start({ visibility: 1 });
		}
		if (global.selection.type.left.value) global.selection.type.left.set(null);
		if (global.selection.type.right.value) global.selection.type.right.set(null);
		if (global.selection.placed.value) global.selection.placed.set(false);
		selectionPosAPI.start({
			center: 0,
			startOffset: 0,
			widthOffset: 0,
		});
		global.selection.slides.set([]);

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

		var zoom = zoomToPx(global.timeline.zoom.value);
		var frameWidth = Math.abs(sx) / zoom;
		var startingFrame = x1 / zoom;

		selectionPosAPI[first && global.selection.hidden.value ? 'set' : 'start']({
			x1,
			y1,
			x2,
			y2,
			startingFrame,
			frameWidth,
		});
		if (!global.selection.active.value) global.selection.active.set(true);
		if (last) {
			global.selection.active.set(false);
			if (distanceTraveled <= minDistance) {
				setSetting('default');
				global.selection.hidden.set(true);
				selectionPosAPI.start({ visibility: 0 });
			} else {
				var endingFrame = startingFrame + frameWidth;
				var expandedTimeline = new Array(...project.timeline.slides.value);
				for (let i = 0; i < expandedTimeline.length; i++) {
					var slide = expandedTimeline[i];
					if (slide.type != 'loop') continue;
					expandedTimeline.splice(i, 0, new loopBeginSlide(slide as loopSlide));
					i++;
				}

				var keyframesInSelection = expandedTimeline.filter(slide =>
					slide.frame >= Math.floor(startingFrame) && slide.frame <= Math.ceil(endingFrame)
				);

				select(keyframesInSelection);
			}
		}
	}, { domTarget: props.selectionDragArea, eventOptions: { passive: false } });

	useMousetrap(['del', 'backspace'], () => {
		if (!global.selection.placed) return;

		var sel = global.selection.slides.attach(Downgraded).value
			.map(s => ({ id: s.id.toString(), type: s.type.toString() }))
			.filter(s => slideTypes.includes(s.type));
		sel.forEach(slide => global.timeline.workingTimeline.find(s => s.value?.id == slide.id).set(none));
		global.update.refreshLiveTimeline.value();

		setSetting('default');
		global.selection.merge({
			placed: false,
			hidden: true,
			slides: [],
		});
		selectionPosAPI.start({ visibility: 0 });
	});

	function CustomSelection(props: {
		x1: number;
		x2: number;
		y1: number;
		y2: number;
		widthOffset: number;
		frameWidth: number;
		visibility: number;
		className: string;
	}) {
		return <Selection
			className={props.className}
			width={props.x2 - props.x1 + 12}
			frameWidth={props.frameWidth}
			height={props.y2 - props.y1 + 12}
			left={selection.type.left.get()}
			right={selection.type.right.get()}
			widthOffset={props.widthOffset}
			visibility={props.visibility}
		/>;
	}
	var AnimatedSelection = animated(props => <CustomSelection {...props} />);

	return <animated.div
		id='selection'
		className={'posabs dispinbl ' + (selection.placed ? 'placed ' : '')}
		ref={selectionRef}
		style={{
			'--starting-frame': selectionPos.startingFrame,
			'--y': selectionPos.y1,
			'--start-offset': selectionPos.startOffset,
			'--center': selectionPos.center,
			pointerEvents: selection.placed.get() ? 'all' : 'none',
		} as CSSProperties}
	>
		<AnimatedSelection
			x1={selectionPos.x1}
			x2={selectionPos.x2}
			y1={selectionPos.y1}
			y2={selectionPos.y2}
			widthOffset={selectionPos.widthOffset}
			frameWidth={selectionPos.frameWidth}
			visibility={selectionPos.visibility}
			className={'' + (selection.active.get() ? 'active ' : '') + (selection.hidden.get() ? 'hidden ' : '')}
		/>
	</animated.div>;
}

function GhostLoop(props: {
	begin: number;
	end: number;
}) {
	return <div className='keyframeWrapper ghost posabs abscenterh'>
		<div
			style={{
				'--begin': props.begin,
				'--length': props.end - props.begin,
			} as CSSProperties}
			className='loop ghost'
		>
			<span className='dispinbl posabs l0 start'>
				<SlideKeyframe type='loop' ghost />
			</span>
			<div className='connector dispinbl' />
			<span className='dispinbl posabs r0 end'>
				<SlideKeyframe type='loop' loopEnd ghost />
			</span>
		</div>
	</div>;
}

function getGhostParams(x: number, y: number, ox?: number, oy?: number) {
	var frame = getFrameAtOffset(x);
	var frameWidth = zoomToPx(global.timeline.zoom.value);

	var springValues = {
		x,
		y,
		frame,
		frameEnd: 0,
		offsetWeight: 1,
	};

	var scrubberX = getOffsetAtFrame(global.timeline.frame.value);
	var snap = (c: number) => Math.abs(scrubberX + 0.5 * frameWidth - c) < 10;

	if (snap(x)) {
		springValues.x = scrubberX;
		springValues.frame = global.timeline.frame.value;
		springValues.offsetWeight = 0;
	}
	if (typeof ox !== 'undefined' && typeof oy !== 'undefined') {
		springValues.frameEnd = springValues.frame + ox / frameWidth;
		if (snap(x + ox)) {
			springValues.frameEnd = global.timeline.frame.value;
			springValues.offsetWeight = 0;
		}

		var a = springValues.frame;
		var b = springValues.frameEnd;
		springValues.frame = Math.round(Math.min(a, b));
		springValues.frameEnd = Math.round(Math.max(a, b));
		springValues.y = 60;
	} else {
		springValues.frameEnd = springValues.frame + 5;
	}

	return springValues;
}

function TimelineEditor() {
	var timelineZoom = useHookstate(global).timeline.zoom;
	var workingTimeline = useHookstate(global).timeline.workingTimeline;
	var tool = useHookstate(global).timeline.tool;

	var mouseX = 0;

	var ready = useHookstate(global).ready;
	var proj = useHookstate(project).timeline;

	var timelineRef = useRef(null);
	var selectionDragArea = useRef(null);
	useEffect(() => {
		timelineRef.current.addEventListener('wheel', (e: WheelEvent) => {
			if (!e.ctrlKey && !e.altKey) return;
			e.preventDefault();

			var newZoom = Math.min(1, Math.max(0, global.timeline.zoom.value + (-e.deltaY / 1000)));
			zoomAroundPoint(newZoom, mouseX);
		});
	}, []);

	useEffect(() => {
		var canvas = document.querySelector('.timeline .timeScale');
		window.addEventListener('mousemove', e => {
			var rect = canvas.getBoundingClientRect();
			mouseX = e.clientX - rect.x;
		});
	}, []);

	useEffect(() => {
		player.addEventListener('TimedVideoPlayerOnFrame', (event: CustomEvent) => {
			global.timeline.frame.set(event.detail);
			scrubberSpring.start({ frame: event.detail });
		});
	}, []);

	useEffect(() => {
		player.addEventListener('TimedVideoPlayerSlide', (event: CustomEvent) => {
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

			var frameWidth = zoomToPx(global.timeline.zoom.value);

			var d = false;
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
								children={player.frameToTimestampString(frame - 1)}
							/>,
						);
					}
				}

				d = !d;
				a++;
			}

			global.timeline.labels.set(labels);

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

	// timeline scrubber
	var scrubberDragRef = useRef(null);
	var [scrubberPos, scrubberSpring] = useSpring(
		() => ({
			frame: 0,
			config: { mass: 0.5, tension: 500, friction: 20 },
		}),
	);
	useDrag(({ xy: [x, _y] }) => {
		var frame = Math.max(0, Math.round(getFrameAtOffset(x - 240)) - 1);
		scrubberSpring.start({ frame });
		if (player.player) {
			var time = player.frameToTimestamp(frame + 1);
			if (isFinite(time)) player.player.currentTime = time;
		}
		global.timeline.frame.set(frame);
	}, { domTarget: scrubberDragRef, eventOptions: { passive: false } });

	// slide placement ghost
	var [ghostPlaced, setGhostPlaced] = useState(false);
	var [ghost, ghostApi] = useSpring(() => ({
		x: 0,
		y: 0,
		frame: 0,
		frameEnd: 0,
		offsetWeight: 1,
		config: { mass: 0.5, tension: 500, friction: 20 },
	}));
	useEffect(() => {
		timelineRef.current.addEventListener('mousemove', (e: MouseEvent) => {
			if ((e.buttons & (1 << 0)) > 0) return;

			var rect = timelineRef.current.getBoundingClientRect();
			var x = e.clientX - rect.left;
			var y = e.clientY - rect.top;

			ghostApi.start(getGhostParams(x, y));
		});
	}, []);
	// place new slide
	useDrag(({ xy: [rx, ry], initial: [ix, iy], movement: [ox, oy], last }) => {
		if (global.timeline.tool.value == 'cursor') return;

		var rect = timelineRef.current.getBoundingClientRect();
		var x = rx - rect.left;
		var y = ry - rect.top;
		if (global.timeline.tool.value == 'loop') {
			setGhostPlaced(true);

			var ghostParams = getGhostParams(ix - rect.left, iy - rect.top, ox, oy);
			ghostApi.start(ghostParams);

			if (last) {
				setGhostPlaced(false);

				var slide = new loopSlide(ghostParams.frameEnd);
				slide.beginFrame = ghostParams.frame;

				global.timeline.workingTimeline[global.timeline.workingTimeline.value.length].set(slide);

				global.update.refreshLiveTimeline.value();

				ghostApi.start(getGhostParams(x, y));
			}
		} else {
			var ghostParams = getGhostParams(x, y);
			ghostApi.start(ghostParams);
			if (last) {
				var offset = -4; // keyframe offset
				var frame = ghostParams.offsetWeight
					? getFrameAtOffset(ghostParams.x + offset) - 0.5
					: ghostParams.frame;
				var slide = new toolToSlide[tool.value](Math.round(frame));
				global.timeline.workingTimeline[global.timeline.workingTimeline.value.length].set(slide);
				keyframeInAnimations[slide.id] = { x: frame, y };
				global.update.refreshLiveTimeline.value();
			}
		}
	}, { domTarget: selectionDragArea });

	return <div
		className={'timeline posrel ' + (ready.timeline.get() ? '' : 'disabled')}
		style={{ '--zoom': zoomToPx(timelineZoom.value) } as CSSProperties}
		ref={timelineRef}
	>
		<canvas
			className='timeScale posabs a0'
			id='timeScaleCanvas'
		/>
		<TimelineLabels />
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
				style={{ '--total-frames': proj.framecount.get() } as CSSProperties}
			>
				<div className='selectionarea posabs v0' ref={selectionDragArea} />
				{workingTimeline.map(slide =>
					<TimelineKeyframe slide={slide.attach(Downgraded).value} key={slide.id.value} />
				)}
				<TimelineSelection selectionDragArea={selectionDragArea} />
				<animated.div
					id='ghost'
					className={'posabs dispinbl ' + (ghostPlaced ? 'placed ' : '')
						+ (global.timeline.tool.value == 'loop' ? 'loop ' : '')}
					style={{
						'--y': ghost.y,
						'--x': ghost.x,
						'--frame': ghost.frame,
						'--frame-end': ghost.frameEnd,
						'--offset-weight': ghost.offsetWeight,
					} as unknown as CSSProperties}
					children={tool.value == 'loop'
						? <GhostLoop begin={0} end={0} />
						: <SlideKeyframe type={tool.value as slideTypes} ghost />}
				/>
				{false && <div className={'ghostArea posabs a0' + (tool.value != 'cursor' ? ' active' : '')}></div>}
			</div>
		</div>
	</div>;
}

function DialogBox(props: {
	open?: boolean;
	close: () => any;
	children: ReactNode;
	title: string;
}) {
	return <Dialog open={props.open} onClose={props.close}>
		<MuiDialogTitle>
			<span className='title'>{props.title}</span>
			<IconButton onClick={props.close} children={<CloseIcon />} />
		</MuiDialogTitle>
		<div className='inner'>
			{props.children}
		</div>
	</Dialog>;
}

function ProjectSettings() {
	var proj = useHookstate(project).timeline;
	var open = useHookstate(global).dialog.projectSettings;

	function close() {
		global.update.refreshLiveTimeline.value();
		open.set(false);
	}

	return <DialogBox open={open.get()} close={close} title='Project settings'>
		<div className='body fullwidth-inputs form-spacing'>
			<TextField
				value={proj.name.get()}
				onChange={e => proj.name.set(e.target.value)}
				label='Project name'
				variant='filled'
			/>
			<TextField
				value={proj.framecount.get()}
				onChange={e => proj.framecount.set(Math.max(0, Number(e.target.value)))}
				label='Frame count'
				variant='filled'
				type='number'
			/>
			<TextField
				value={proj.framerate.get()}
				onChange={e => proj.framerate.set(Math.max(0, Number(e.target.value)))}
				label='Framerate'
				variant='filled'
				type='number'
			/>
		</div>
	</DialogBox>;
}

function DefaultSettings() {
	var [nextSlideKeybinds, setNextSlideKeybinds] = useState(['Space', 'n', 'Enter']);
	var [previousSlideKeybinds, setPreviousSlideKeybinds] = useState(['Backspace', 'p']);
	var [showMenuKeybinds, setShowMenuKeybinds] = useState(['Escape', 'm']);

	var proj = useHookstate(project).timeline;

	var ready = useHookstate(global).ready;

	return <>
		<ProjectSettings />
		<h2 className='title posabs h0 t0'>Presentation settings</h2>
		<div className='scroll posabs h0 b0'>
			<div className={'section ' + (ready.timeline.value ? '' : 'disabled')}>
				<span className='title'>Controls</span>
				<div className='sidebyside'>
					<span className='body'>Allow remote control during presentation</span>
					<Switch />
				</div>
				<FormControl variant='filled'>
					<InputLabel>On-screen controls</InputLabel>
					<Select
						labelId='demo-simple-select-filled-label'
						id='demo-simple-select-filled'
						value={proj.settings.controlType.get()}
						onChange={e =>
							proj.settings.controlType.set(e.target.value as presentationSettings['controlType'])}
						IconComponent={ArrowDropDownRoundedIcon}
					>
						<MenuItem value='FullScreen'>
							<div className='posrel os-controls-type fullscreen'>
								<span className='label'>Full screen</span>
								<div className='inner'>
									<div className='sidebyside'>
										<div className='posrel icon'>
											<div className='posabs abscenterv'>
												<FullScreenControlsRoundedIcon />
											</div>
										</div>
										<div className='description'>
											<span className='title'>Full screen</span>
											<span className='body'>
												Full screen columns to click through slides. Press center to show menu
											</span>
										</div>
									</div>
								</div>
							</div>
						</MenuItem>
						<MenuItem value='MenuBar'>
							<div className='posrel os-controls-type menubar'>
								<span className='label'>Menu Bar</span>
								<div className='inner'>
									<div className='sidebyside'>
										<div className='posrel icon'>
											<div className='posabs abscenterv'>
												<MenuBarControlsRoundedIcon />
											</div>
										</div>
										<div className='description'>
											<span className='title'>Menu bar</span>
											<span className='body'>
												Floating controls that snap to the screen edge
											</span>
										</div>
									</div>
								</div>
							</div>
						</MenuItem>
					</Select>
				</FormControl>
			</div>
			<div className={'section ' + (ready.timeline.value ? '' : 'disabled')}>
				<span className='title'>Keybindings</span>
				<KeybindSelector label='Next slide' value={nextSlideKeybinds} onChange={setNextSlideKeybinds} />
				<KeybindSelector
					label='Previous slide'
					value={previousSlideKeybinds}
					onChange={setPreviousSlideKeybinds}
				/>
				<KeybindSelector label='Show menu' value={showMenuKeybinds} onChange={setShowMenuKeybinds} />
			</div>
			<div className='section'>
				<span className='title'>Cool temporary buttons</span>
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
							global.ready.video.available.set(true);

							player.player.addEventListener(
								'canplaythrough',
								() => global.ready.video.playable.set(true),
							);

							player.player.addEventListener('play', () => global.timeline.playing.set(true));
							player.player.addEventListener('pause', () => global.timeline.playing.set(false));
						});
						reader.readAsDataURL(file);
					}}
				/>
				<Button
					variant='contained'
					color='default'
					children='Load video'
					onClick={() => document.getElementById('vidUpload').click()}
					startIcon={<VideoLabelRoundedIcon />}
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
							project.timeline.set(player.timeline);
							global.timeline.workingTimeline.set(player.timeline.slides);
							global.update.refreshLiveTimeline.value();
							global.ready.timeline.set(true);
						});
						reader.readAsText(file);
					}}
				/>
				<Button
					variant='contained'
					color='default'
					children='Load json'
					onClick={() => document.getElementById('jsonUpload').click()}
					startIcon={<CodeRoundedIcon />}
				/>
				<Button
					variant='contained'
					color='default'
					children='Download json'
					onClick={() => {
						var timeline = project.timeline.attach(Downgraded).value;
						var data = JSON.stringify(timeline);
						var blob = new Blob([data], { type: 'application/json' });
						var a = document.createElement('a');
						a.href = URL.createObjectURL(blob);
						a.download = player.timeline.name
							.toLowerCase()
							.replace(/\s/g, '-');
						a.click();
					}}
					startIcon={<GetAppRoundedIcon />}
				/>
				<Button
					variant='contained'
					color='default'
					children='New project'
					onClick={() => {
						var newProj: timeline = {
							slides: [],
							name: 'New project',
							settings: { controlType: 'FullScreen' },
							framerate: 0,
							framecount: 0,
						};
						player.loadSlides(JSON.stringify(newProj));
						project.timeline.set(player.timeline);
						global.timeline.workingTimeline.set(player.timeline.slides);
						global.update.refreshLiveTimeline.value();
						global.ready.timeline.set(true);
						global.dialog.projectSettings.set(true);
					}}
					startIcon={<AddRoundedIcon />}
				/>
				<Button
					variant='contained'
					color='default'
					children='Project settings'
					onClick={() => global.dialog.projectSettings.set(true)}
					startIcon={<SettingsRoundedIcon />}
				/>
			</div>
		</div>
	</>;
}

function SlideSettings() {
	return <>
		<h2 className='title posabs h0 t0'>Slide settings</h2>
		<div className='scroll posabs h0 b0'>
			<div className='section'>
				<span className='title'>Cool</span>
			</div>
		</div>
	</>;
}

function zoomAroundPoint(newZoom: number, pivot: number) {
	var timeline = document.querySelector('.timeline .timelineInner');
	var frame = getFrameAtOffset(pivot);
	var newOffset = (frame * zoomToPx(newZoom)) - pivot;

	timeline.scrollLeft = newOffset;
	global.timeline.zoom.set(newZoom);
}

var switchToTool = (tool: string) => () => global.ready.timeline.value && global.timeline.tool.set(tool);

function Tools() {
	var frame = useHookstate(global).timeline.frame;
	var tool = useHookstate(global).timeline.tool;
	var timelineZoom = useHookstate(global).timeline.zoom;
	var ready = useHookstate(global).ready;
	var framerate = useHookstate(project).timeline.framerate;

	useMousetrap(['v'], switchToTool('cursor'));
	useMousetrap(['d'], switchToTool('default'));
	useMousetrap(['l'], switchToTool('loop'));
	useMousetrap(['e'], switchToTool('delay'));
	useMousetrap(['s'], switchToTool('speedChange'));

	return <div className='tools'>
		<div className={'time posrel ' + (ready.timeline.get() ? '' : 'disabled')}>
			<span className='framerate numbers posabs l0 t0'>@{framerate.get()}fps</span>
			<h2 className='timecode numbers posabs r0 t0'>
				{player.frameToTimestampString(frame.get(), false)}
			</h2>
		</div>
		<ToggleButtonGroup
			className={ready.timeline.get() ? '' : 'disabled'}
			color='primary'
			aria-label='outlined primary button group'
			value={tool.get()}
			exclusive
			onChange={(_event: any, newTool: string | null) => {
				if (newTool === null) return;
				tool.set(newTool);
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
		<div className={'zoom ' + (ready.timeline.get() ? '' : 'disabled')}>
			<ZoomOutRoundedIcon />
			<div className='spacing'>
				<Slider
					value={timelineZoom.value}
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
	</div>;
}

var settingsArr: ReactNode[] = [null, global.settings.node.attach(Downgraded).value];
function SettingsPane() {
	var settings = useHookstate(global).settings;
	var key = uuid();

	settingsArr[0] = settingsArr[1];
	settingsArr[1] = settings.node.attach(Downgraded).value;

	return <div className='settings fullwidth-inputs posrel'>
		<FadeThroughTransition
			key={key}
			from={<div className='inner posabs a0' children={settingsArr[0]} />}
			to={<div className='inner posabs a0' children={settingsArr[1]} />}
			show={true}
		/>
	</div>;
}

function Player() {
	var playing = useHookstate(global).timeline.playing;
	var ready = useHookstate(global).ready;

	var playerRef = useRef(null);
	useEffect(() => {
		player.registerPlayer(playerRef.current);
	}, []);

	return <div className='viewer'>
		<div className={'player posrel ' + (ready.video.available.get() ? '' : 'disabled')}>
			<div className='outer posabs abscenter'>
				<video id='player' ref={playerRef} className='fullwidth' />
			</div>
		</div>
		<div className={'controls ' + (ready.timeline.get() ? '' : 'disabled')}>
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
					className={'playPause ' + (ready.video.playable.get() ? '' : 'disabled')}
					size='medium'
					onClick={() => {
						player.next();
						player.player.play();
					}}
					children={<PlaySkipIconAni />}
					style={{ '--ani-state': playing.get() ? 'skip' : 'play' } as CSSProperties}
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
	</div>;
}

function TitleBar() {
	return <AppBar position='static' color='transparent' elevation={0}>
		<Toolbar>
			<PressureIcon />
			<h1>pressure</h1>
		</Toolbar>
	</AppBar>;
}

export default function Index() {
	useEffect(() => {
		var preventDefault = (e: Event) => e.preventDefault();
		document.addEventListener('gesturestart', preventDefault);
		document.addEventListener('gesturechange', preventDefault);
	}, []);

	return <>
		<div className='appGrid posabs a0'>
			<TitleBar />
			<SettingsPane />
			<Player />
			<Tools />
			<TimelineEditor />
		</div>
	</>;
}
