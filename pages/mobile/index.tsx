import { ReactNode, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Toolbar from '@material-ui/core/Toolbar';

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

export type pages = 'home' | 'account' | 'settings';
export function MobileWrapper(props: {
	children?: ReactNode;
	page: pages;
	nobar?: boolean;
}) {
	var [drawerOpen, setDrawerOpen] = useState(false);

	return <div className='mobile'>
		{!props.nobar && <AppBar position='static'>
			<Toolbar>
				<IconButton edge='start' color='inherit' aria-label='menu' onClick={() => setDrawerOpen(true)}>
					<MenuRoundedIcon />
				</IconButton>
				<h3>Pressure</h3>
			</Toolbar>
		</AppBar>}
		<SwipeableDrawer
			anchor='left'
			open={drawerOpen}
			onOpen={() => setDrawerOpen(true)}
			onClose={() => setDrawerOpen(false)}
		>
			<List>
				<div className='listWrapper'>
					<ListItem>
						<ListItemText>
							<h3>Pressure</h3>
						</ListItemText>
					</ListItem>
					<Divider />
					<ListItem button selected={props.page == 'home'}>
						<ListItemIcon children={<HomeRoundedIcon />} />
						<ListItemText primary='Home' />
					</ListItem>
					<div className='b0 posabs dispbl fullwidth'>
						<ListItem button selected={props.page == 'account'}>
							<ListItemIcon children={<AccountCircleRoundedIcon />} />
							<ListItemText primary='Account' />
						</ListItem>
						<ListItem button selected={props.page == 'settings'}>
							<ListItemIcon children={<SettingsRoundedIcon />} />
							<ListItemText primary='Settings' />
						</ListItem>
					</div>
				</div>
			</List>
		</SwipeableDrawer>
		<div className='inner' children={props.children} />
	</div>;
}

export default function Mobile() {
	return <MobileWrapper page='home'>
		<h2>gert</h2>
	</MobileWrapper>;
}
