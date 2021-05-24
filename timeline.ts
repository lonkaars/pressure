export type slideTypes = 'default' | 'delay' | 'speedChange' | 'loop';
export type anySlide = slide | delaySlide | speedChangeSlide | loopSlide;

export interface slide {
	frame: number;
	clickThroughBehaviour: 'ImmediatelySkip' | 'PlayOut';
	type: slideTypes;
	id: string;
}

export interface delaySlide extends slide {
	delay: number;
}

export interface speedChangeSlide extends slide {
	newFramerate: number;
}

export interface loopSlide extends slide {
	beginFrame: number;
	playbackType: 'PingPong' | 'Normal';
}

export interface presentationSettings {
	controlType: 'FullScreen';
}

export default interface timeline {
	slides: Array<anySlide>;
	framecount: number;
	framerate: number;
	name: string;
	settings: presentationSettings;
}
