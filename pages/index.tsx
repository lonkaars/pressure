import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { PressureIcon, SlideKeyframe } from '../components/icons';

export default function Index() {
	return <>
		<AppBar position='static' color='transparent' elevation={0}>
			<Toolbar>
				<PressureIcon />
				<h1>pressure</h1>
			</Toolbar>
		</AppBar>
	</>;
}
