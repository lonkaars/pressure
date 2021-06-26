import Grow from '@material-ui/core/Grow';
import { ReactNode, useEffect, useState } from 'react';

export default function FadeThroughTransition(props: {
	from: ReactNode;
	to: ReactNode;
	show: boolean;
}) {
	var [firstRender, setFirstRender] = useState(true);
	useEffect(() => {
		setTimeout(() => setFirstRender(false), 0);
	}, []);

	return <div className='posabs a0 fadethrough'>
		<div className={'fadeout ' + (firstRender ? 'first' : '')}>
			<div className='posabs a0 from'>{props.from}</div>
		</div>
		<Grow in={props.show} timeout={300}>
			<div className='posabs a0 to'>{props.to}</div>
		</Grow>
	</div>;
}
