import { MediaInfo as Mediainfo, ResultObject } from 'mediainfo.js/dist/types';
import JSZip from 'jszip';
import { TimedVideoPlayer } from './pages/present';

import { LocalVideoSettings } from './components/videosourcesettings';

// garbage garbage garbage
declare var MediaInfo: () => Promise<Mediainfo>;

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

export default class {
	version: string;
	zip: JSZip;
	project: TimedVideoPlayer['timeline'];
	video: VideoSourceClass;

	constructor() {
		this.version = '0.1.1';
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
		var meta = this.zip.folder('meta');
		meta.file('version', this.version);
		meta.file('name', this.project.name);

		var settings = this.zip.folder('settings');
		settings.file('controlType', this.project.settings.controlType);

		var source = this.zip.folder('source');
		this.video.save(source);
		source.file('mimetype', this.video.mimetype);
		source.file('config', JSON.stringify(this.video.config, null, 4));

		this.zip.file('slides', JSON.stringify(this.project.slides, null, 4));
	}

	async openProject(data: ArrayBuffer) {
		this.zip = new JSZip();
		await this.zip.loadAsync(data);
		this.project = {
			name: await this.zip.file('meta/name').async('string'),
			settings: { controlType: await this.zip.file('settings/controlType').async('string') },
			slides: JSON.parse(await this.zip.file('slides').async('string')),
			framerate: Number(await this.zip.file('source/framerate').async('string')),
			framecount: Number(await this.zip.file('source/framecount').async('string')),
		} as TimedVideoPlayer['timeline'];
		var type = await this.zip.file('source/type').async('string');
		var videoSourceType = VideoSources.find(s => s.type == type);
		if (!videoSourceType) return;
		this.video = new videoSourceType.class(await this.zip.file('source/video').async('arraybuffer'));
		this.video.mimetype = await this.zip.file('source/mimetype').async('string');
		this.video.config = JSON.parse(await this.zip.file('source/config').async('string'));
	}
}
