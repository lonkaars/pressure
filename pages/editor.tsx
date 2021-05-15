import { useEffect, useState } from 'react';
import { loopSlide } from '../timeline';
import { TimedVideoPlayer } from './present';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Toolbar from '@material-ui/core/Toolbar';

import { PressureIcon, SlideKeyframe } from '../components/icons';

import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';

function TimelineEditor(props: {
	player: TimedVideoPlayer;
}) {
	var frames = [...new Array(props.player.timeline?.framecount || 0)].map((el, i) =>
		<div className='frame'>
			<span className='timecode numbers posabs abscenterh'>
				{props.player?.frameToTimestampString(i + 1)}
			</span>
			<div className='keyframeWrapper posabs abscenterh'>
				{(() => {
					var slide = props.player?.timeline?.slides.find(slide => slide.frame == i + 1);
					if (slide) {
						return <SlideKeyframe type={slide.type} loopEnd />;
					}
					var loop = props.player?.timeline?.slides.find(slide =>
						slide.type == 'loop' && (slide as loopSlide).beginFrame == i + 1
					);
					if (loop) {
						return <SlideKeyframe type='loop' />;
					}
				})()}
			</div>
		</div>
	);

	return <div className='frames'>{frames}</div>;
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
			<div className='tools'></div>
			<div className='timeline'>
				<TimelineEditor
					player={player}
				/>
			</div>
		</div>
	</>;
}
