import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
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
import { LoginRoundedIcon, QRCodeRoundedIcon } from '../../components/icons';

export type pages = 'home' | 'account' | 'settings';
export function MobileWrapper(props: {
	children?: ReactNode;
	page: pages;
	nobar?: boolean;
}) {
	var [drawerOpen, setDrawerOpen] = useState(false);
	var [iOS, setIOS] = useState(false);
	useEffect(() => {
		setIOS(process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent));
	}, []);

	return <div className='mobile'>
		<Head>
			<meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
			<meta name='theme-color' content='#171D33' />
			<link rel='manifest' href='/mobile/manifest.json' />

			<link rel='apple-touch-icon' sizes='512x512' href='/img/icon-remote-ios-512x512.png' />
			<link rel='apple-touch-icon' sizes='384x384' href='/img/icon-remote-ios-384x384.png' />
			<link rel='apple-touch-icon' sizes='192x192' href='/img/icon-remote-ios-192x192.png' />
			<link rel='apple-touch-icon' sizes='180x180' href='/img/icon-remote-ios-180x180.png' />
			<link rel='apple-touch-icon' sizes='152x152' href='/img/icon-remote-ios-152x152.png' />
			<link rel='apple-touch-icon' sizes='144x144' href='/img/icon-remote-ios-144x144.png' />
			<link rel='apple-touch-icon' sizes='128x128' href='/img/icon-remote-ios-128x128.png' />
			<link rel='apple-touch-icon' sizes='120x120' href='/img/icon-remote-ios-120x120.png' />
			<link rel='apple-touch-icon' sizes='96x96' href='/img/icon-remote-ios-96x96.png' />
			<link rel='apple-touch-icon' sizes='72x72' href='/img/icon-remote-ios-72x72.png' />
		</Head>
		<style
			children='
			html, body {
				position: fixed;
				overflow: hidden;
				width: 100vw;
				height: 100vh;
			}
		'
		/>
		<style
			children='
			body {
				background-color: var(--c300);
			}
		'
		/>
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
			disableBackdropTransition={!iOS}
			disableDiscovery={iOS}
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
					<div className='bottomActions posabs dispbl fullwidth'>
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
		<Button
			variant='outlined'
			color='secondary'
			startIcon={<QRCodeRoundedIcon />}
			children='Scan QR code'
		/>
		<Button
			variant='contained'
			color='secondary'
			startIcon={<LoginRoundedIcon />}
			children='Log in'
		/>
	</MobileWrapper>;
}
