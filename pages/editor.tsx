import { useEffect, useState } from 'react';
import { loopSlide } from '../timeline';
import { TimedVideoPlayer } from './present';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Fab from '@material-ui/core/Fab';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@mdi/react';

import { PressureIcon, SlideKeyframe } from '../components/icons';
import Loop from '../components/loop';

import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';
import { mdiCursorDefault } from '@mdi/js';

function TimelineEditor(props: {
	player: TimedVideoPlayer;
}) {
	var frames = [...new Array(props.player.timeline?.framecount || 0)].map((el, i) =>
		<div className='frame'>
			<div className='line posabs abscenterh b0' />
			<span className='timecode nosel numbers posabs abscenterh'>
				{props.player?.frameToTimestampString(i + 1)}
			</span>
			<div className='keyframeWrapper posabs abscenterh'>
				{(() => {
					var slide = props.player?.timeline?.slides.find(slide => slide.frame == i + 1);
					if (slide) {
						if (slide.type == 'loop') {
							return <Loop length={slide.frame - (slide as loopSlide).beginFrame} />;
						} else {
							return <SlideKeyframe type={slide.type} />;
						}
					}
				})()}
			</div>
		</div>
	);

	return <>
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
		<div className='frames'>{frames}</div>
	</>;
}

export default function Index() {
	var [dummy, setDummy] = useState(false);
	var rerender = () => setDummy(!dummy);
	var [player, setPlayer] = useState(new TimedVideoPlayer());

	useEffect(() => {
		var videoEL = document.getElementById('player') as HTMLVideoElement;
		player.registerPlayer(videoEL);
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
			</div>
			<div className='timeline posrel'>
				<TimelineEditor
					player={player}
				/>
			</div>
		</div>
	</>;
}
