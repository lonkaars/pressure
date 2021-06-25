import { v4 as uuid } from 'uuid';

export type slideTypes = 'default' | 'delay' | 'speedChange' | 'loop';
export var slideTypes = ['default', 'delay', 'speedChange', 'loop'];
export type anySlide = slide | delaySlide | speedChangeSlide | loopSlide;

export class slide {
	clickThroughBehaviour: 'ImmediatelySkip' | 'PlayOut' = 'ImmediatelySkip';
	type: slideTypes = 'default';
	id: string;

	constructor(public frame: number) {
		this.id = uuid();
	}
}

export class delaySlide extends slide {
	type = 'delay' as slideTypes;
	delay: number = 1;
}

export class speedChangeSlide extends slide {
	type = 'speedChange' as slideTypes;
	newFramerate: number = 60;
}

export class loopSlide extends slide {
	type = 'loop' as slideTypes;
	beginFrame: number = this.frame - 30;
	playbackType: 'PingPong' | 'Normal' = 'Normal';
}

export class loopBeginSlide extends slide {
	type = 'loopBegin' as slideTypes;
}

export var toolToSlide = {
	default: slide,
	delay: delaySlide,
	speedChange: speedChangeSlide,
	loop: loopSlide,
};

export interface presentationSettings {
	controlType: 'FullScreen' | 'MenuBar';
}

export default interface timeline {
	slides: Array<anySlide>;
	framecount: number;
	framerate: number;
	name: string;
	settings: presentationSettings;
}
