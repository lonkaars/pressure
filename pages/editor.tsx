import AppBar from '@material-ui/core/AppBar';
import Fab from '@material-ui/core/Fab';
import Toolbar from '@material-ui/core/Toolbar';

import { PressureIcon } from '../components/icons';

import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import SkipPreviousRoundedIcon from '@material-ui/icons/SkipPreviousRounded';

export default function Index() {
	return <>
		<div className='appGrid posabs a0'>
			<AppBar position='static' color='transparent' elevation={0}>
				<Toolbar>
					<PressureIcon />
					<h1>pressure</h1>
				</Toolbar>
			</AppBar>
			<div className='settings'></div>
			<div className='viewer'>
				<div className='player'></div>
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
			<div className='timeline'></div>
		</div>
	</>;
}
