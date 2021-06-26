import Fade from '@material-ui/core/Fade';
import Grow from '@material-ui/core/Grow';
import { ReactNode } from 'react';

export default function FadeThroughTransition(props: {
	from: ReactNode;
	to: ReactNode;
	show: boolean;
}) {
	return <div className='posabs a0 fadethrough'>
		<Grow in={props.show} timeout={500}>
			<div className='posabs a0 to'>{props.to}</div>
		</Grow>
		<Fade in={!props.show}>
			<div className='posabs a0 from'>{props.from}</div>
		</Fade>
	</div>;
}
