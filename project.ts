import { MediaInfo as Mediainfo, ResultObject } from 'mediainfo.js/dist/types';
import JSZip from 'jszip';
import semver from 'semver';
import { TimedVideoPlayer } from './pages/present';

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
	load: (data: ArrayBuffer) => void;
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

	constructor(video?: ArrayBuffer) {
		this.type = 'local';
		this.config = {
			fullyBuffer: false,
		};
		if (video) this.load(video);
	}

	async load(data: ArrayBuffer) {
		this.source = data;
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
	project: TimedVideoPlayer['timeline'];
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
		a.download = this.project.name
			.toLowerCase()
			.replace(/\s/g, '-') + filext;
		a.click();
	}

	loadProject(project: TimedVideoPlayer['timeline']) {
		this.project = project;
	}

	saveProject() {
		this.zip = new JSZip();

		var meta = this.zip.folder('meta');
		meta.file('version', this.version);
		meta.file('name', this.project.name);

		var source = this.zip.folder('source');
		this.video.save(source);
		source.file('mimetype', this.video.mimetype);
		source.file('config', JSON.stringify(this.video.config, null, 4));

		this.zip.file('slides', JSON.stringify(this.project.slides, null, 4));
		this.zip.file('settings', JSON.stringify(this.settings, null, 4));
	}

	async openProject(data: ArrayBuffer) {
		this.zip = new JSZip();
		await this.zip.loadAsync(data);

		this.fileVersion = await this.zip.file('meta/version').async('string');
		this.project = {
			name: await this.zip.file('meta/name').async('string'),
			slides: JSON.parse(await this.zip.file('slides').async('string')),
			framerate: Number(await this.zip.file('source/framerate').async('string')),
			framecount: Number(await this.zip.file('source/framecount').async('string')),
		} as TimedVideoPlayer['timeline'];

		var type = await this.zip.file('source/type').async('string');
		var videoSourceType = VideoSources.find(s => s.type == type);

		this.video = new videoSourceType.class(await this.zip.file('source/video').async('arraybuffer'));
		this.video.mimetype = await this.zip.file('source/mimetype').async('string');

		if (semver.lt('0.1.1', this.fileVersion)) {
			this.video.config = JSON.parse(await this.zip.file('source/config').async('string'));
		}

		if (semver.lt('0.2.0', this.fileVersion)) {
			this.settings = JSON.parse(await this.zip.file('settings').async('string'));
		}
	}
}
