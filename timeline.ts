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

export default interface timeline {
	slides: Array<slide | delaySlide | speedChangeSlide | loopSlide>;
	framecount: number;
	framerate: number;
}
