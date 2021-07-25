import { MediaInfo as Mediainfo, ResultObject } from 'mediainfo.js/dist/types';
import JSZip from 'jszip';
import semver from 'semver';
import timeline from './timeline';

import { LocalVideoSettings } from './components/videosourcesettings';

// garbage garbage garbage
declare var MediaInfo: () => Promise<Mediainfo>;

export function arrayBufferToBase64(buffer: ArrayBuffer, mimetype?: string) {
	var out = '';
	if (mimetype) out += 'data:' + mimetype + ';base64,';
	out += btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
	return out;
}

const filext = '.prspr';

interface VideoSource {
	load: (dir: JSZip) => void;
	save: (dir: JSZip) => void;
}

export class LocalVideo implements VideoSource {
	source: ArrayBuffer;
	type: string;
	mimetype: string;

	framerate: number;
	framecount: number;

	config: {
		fullyBuffer: boolean;
	};

	constructor() {
		this.type = 'local';
		this.config = {
			fullyBuffer: false,
		};
	}

	async getVideoInfo() {
		var mediainfo = await MediaInfo();
		var result = await mediainfo.analyzeData(
			() => this.source.byteLength,
			(size, offset) => new Uint8Array(this.source.slice(offset, offset + size)),
		) as ResultObject;

		var meta = result.media.track[0] as unknown as {
			FrameCount: string;
			FrameRate: string;
		};

		this.framecount = Number(meta.FrameCount);
		this.framerate = Number(meta.FrameRate);
	}

	async load(dir: JSZip) {
		this.source = await dir.file('video').async('arraybuffer');
		this.framerate = Number(await dir.file('framerate').async('string'));
		this.framecount = Number(await dir.file('framecount').async('string'));
	}

	save(dir: JSZip) {
		dir.file('video', this.source);
		dir.file('framecount', this.framecount.toString());
		dir.file('framerate', this.framerate.toString());
		dir.file('type', this.type);
	}
}

export const VideoSources = [
	{ type: 'local', class: LocalVideo, name: 'Local video', settings: LocalVideoSettings },
] as const;

export type VideoSourceClass = InstanceType<typeof VideoSources[number]['class']>;
export type VideoSourceType = typeof VideoSources[number]['type'];

export class PresentationSettings {
	keybindings: {
		NextSlide: string[];
		PreviousSlide: string[];
		ShowMenu: string[];
	};
	controls: {
		ControlType: 'FullScreen' | 'MenuBar';
	};
	remotes: {
		AllowRemotes: boolean;
		AllowQRRemotes: boolean;
	};

	constructor() {
		this.keybindings = {
			NextSlide: ['Space', 'n', 'Enter'],
			PreviousSlide: ['Backspace', 'p'],
			ShowMenu: ['Escape', 'm'],
		};
		this.controls = {
			ControlType: 'FullScreen',
		};
		this.remotes = {
			AllowRemotes: false,
			AllowQRRemotes: false,
		};
	}
}

export default class {
	version: string = '0.2.0';
	fileVersion: string;
	zip: JSZip;
	timeline: timeline;
	name: string;
	video: VideoSourceClass;
	settings: PresentationSettings;

	constructor() {
		this.settings = new PresentationSettings();
		this.zip = new JSZip();
	}

	async downloadProjectFile() {
		var zip = await this.zip.generateAsync({ type: 'blob' });
		var blob = new Blob([zip], { type: 'application/octet-stream' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = this.name
			.toLowerCase()
			.replace(/\s/g, '-') + filext;
		a.click();
	}

	saveProject() {
		this.zip = new JSZip();

		var meta = this.zip.folder('meta');
		meta.file('version', this.version);
		meta.file('name', this.name);

		var source = this.zip.folder('source');
		this.video.save(source);
		source.file('mimetype', this.video.mimetype);
		source.file('config', JSON.stringify(this.video.config, null, 4));

		this.zip.file('slides', JSON.stringify(this.timeline, null, 4));
		this.zip.file('settings', JSON.stringify(this.settings, null, 4));
	}

	async openProject(data: ArrayBuffer) {
		this.zip = new JSZip();
		await this.zip.loadAsync(data);

		this.fileVersion = await this.zip.file('meta/version').async('string');
		this.timeline = JSON.parse(await this.zip.file('slides').async('string'));
		this.name = await this.zip.file('meta/name').async('string');

		var source = this.zip.folder('source');
		var type = await source.file('type').async('string');
		var videoSourceType = VideoSources.find(s => s.type == type);

		this.video = new videoSourceType.class();
		await this.video.load(source);
		this.video.mimetype = await source.file('mimetype').async('string');

		if (semver.lt('0.1.1', this.fileVersion)) {
			this.video.config = JSON.parse(await this.zip.file('source/config').async('string'));
		}

		if (semver.lt('0.2.0', this.fileVersion)) {
			this.settings = JSON.parse(await this.zip.file('settings').async('string'));
		}
	}
}
