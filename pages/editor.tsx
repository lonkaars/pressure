import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { PressureIcon } from '../components/icons';

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
			<div className='viewer'></div>
			<div className='tools'></div>
			<div className='timeline'></div>
		</div>
	</>;
}
