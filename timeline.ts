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
	endFrame: number;
	playbackType: 'PingPong' | 'Normal';
}

export interface timeline {
	slides: slide[];
	framecount: number;
	framerate: number;
}
