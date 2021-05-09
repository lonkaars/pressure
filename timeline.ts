interface slide {
	frame: number
	clickThroughBehaviour: "ImmediatelySkip" | "PlayOut"
	type: "default" | "delay" | "speedChange" | "loop"
}

interface delaySlide extends slide {
	delay: number
}

interface speedChangeSlide extends slide {
	newFramerate: number
}

interface loopSlide extends slide {
	endFrame: number
	playbackType: "PingPong" | "Normal"
}

interface timeline {
	slides: slide[]
	framecount: number
	framerate: number
}

