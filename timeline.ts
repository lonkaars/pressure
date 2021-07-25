import { v4 as uuid } from 'uuid';

export const slideTypes = ['default', 'delay', 'speedChange', 'loop'] as const;
export type slideTypes = typeof slideTypes[number];

export const clickThroughBehaviours = ['ImmediatelySkip', 'PlayOut'] as const;
export type clickThroughBehaviours = typeof clickThroughBehaviours[number];

export type anySlide = slide | delaySlide | speedChangeSlide | loopSlide;

export class slide {
	clickThroughBehaviour: clickThroughBehaviours = 'ImmediatelySkip';
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

	constructor(public parent: loopSlide) {
		super(parent.beginFrame);
		this.id = parent.id;
	}
}

export var toolToSlide = {
	default: slide,
	delay: delaySlide,
	speedChange: speedChangeSlide,
	loop: loopSlide,
};

type timeline = Array<anySlide>;
export default timeline;
