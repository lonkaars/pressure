export type keyframeTypes = 'default' | 'delay' | 'speedChange' | 'loop';

export interface slide {
	frame: number;
	clickThroughBehaviour: 'ImmediatelySkip' | 'PlayOut';
	type: keyframeTypes;
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
	slides: Array<slide | delaySlide | speedChangeSlide | loopSlide>;
	framecount: number;
	framerate: number;
	name: string;
	settings: presentationSettings;
}
