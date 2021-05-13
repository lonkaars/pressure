export type keyframeTypes = 'default' | 'delay' | 'speedChange' | 'loop';

export interface slide {
	frame: number;
	clickThroughBehaviour: 'ImmediatelySkip' | 'PlayOut';
	type: keyframeTypes;
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

type anySlide = slide | delaySlide | speedChangeSlide | loopSlide;

export default interface timeline {
	slides: Array<anySlide>;
	framecount: number;
	framerate: number;
}
