import { MediaInfo as Mediainfo, ResultObject } from 'mediainfo.js/dist/types';
import JSZip from 'jszip';
import { TimedVideoPlayer } from './pages/present';

// garbage garbage garbage
declare var MediaInfo: () => Promise<Mediainfo>;

const filext = '.prspr';

export class LocalVideo {
	source: ArrayBuffer;
	fileext: string;
	mimetype: `video/${string}`;
	type: string;

	framerate: number;
	framecount: number;

	constructor() {
		this.type = 'local';
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
		dir.file('video.' + this.fileext, this.source);
	}
}

export type VideoSources = [LocalVideo];

export default class {
	version: string;
	zip: JSZip;
	project: TimedVideoPlayer['timeline'];
	video: VideoSources[number];

	constructor() {
		this.version = '0.1.0';
		this.zip = new JSZip();
	}

	loadProjectFile(data: Blob) {
		this.zip = new JSZip(data);
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

		this.zip.file('slides', JSON.stringify(this.project.slides, null, 4));
	}

	openProject() {
	}
}
