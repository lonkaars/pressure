import { useEffect, useRef } from 'react';

interface controlsPropsType {
	next: () => void;
	previous: () => void;
	menu: () => void;
}

export function FullScreenControls({ next, previous, menu }: controlsPropsType) {
	return <div className='fullscreenControls posabs a0'>
		<div className='control previous' onClick={previous} />
		<div className='control menu' onClick={menu} />
		<div className='control next' onClick={next} />
	</div>;
}

export function MenuBarControls({ next, previous, menu }: controlsPropsType) {
	var canvasRef = useRef(null);

	var options = {
		margin: 24, // screen margin
		friction: 0.2, // friction
		edgeForce: 0.4, // force outside margin (inwards to edges)
		centerForce: 0.4, // force inside margin (outwards to edges)
		maxForce: 10, // limit force to not go over this value
		doneTolerance: 0.5, // if movement per frame goes below this value the animation is considered done
		releaseSlopeAverageCount: 3,
	};

	var positionHistory: [number, number][] = [];
	var slopeAverage: [number, number][] = [];

	useEffect(() => {
		var canvas = canvasRef.current as HTMLCanvasElement;
		var ctx = canvas.getContext('2d');

		var physicsObject = {
			velocity: [0, 0],
			position: [0, 0],
		};

		var mouseX = 0;
		var mouseY = 0;
		var mouseDown = false;

		function draw() {
			positionHistory.push([mouseX, mouseY]);
			if (positionHistory.length >= options.releaseSlopeAverageCount + 1) positionHistory.shift();

			var box = {
				outer: {
					x: 0,
					y: 0,
					width: canvas.width,
					height: canvas.height,
				},
				inner: {
					x: options.margin,
					y: options.margin,
					width: Math.max(0, canvas.width - 2 * options.margin),
					height: Math.max(0, canvas.height - 2 * options.margin),
				},
			};

			function findCenter(x: number, y: number): [number, number] {
				var ratio = canvas.width / canvas.height;
				var coolZone = (Math.abs(ratio - 1) * canvas.height) / 2;
				var hw = canvas.width / 2;
				var hh = canvas.height / 2;

				if (ratio > 1) {
					if (x < hw - coolZone) {
						return [hw - coolZone, hh];
					} else if (x > hw + coolZone) {
						return [hw + coolZone, hh];
					} else {
						return [x, hh];
					}
				} else if (ratio < 1) {
					if (y < hh - coolZone) {
						return [hw, hh - coolZone];
					} else if (y > hh + coolZone) {
						return [hw, hh + coolZone];
					} else {
						return [hw, y];
					}
				} else {
					return [hw, hh];
				}
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 2;

			var center = findCenter(physicsObject.position[0], physicsObject.position[1]);
			var position = physicsObject.position;

			var slope = (position[1] - center[1]) / (position[0] - center[0]);
			if (Math.abs(slope) < 1) {
				var right = position[0] > center[0];
				if (right) {
					var x = box.inner.x + box.inner.width;
					var y = (x - position[0]) * slope + position[1];
				} else {
					var x = box.inner.x;
					var y = (position[0] - x) * -slope + position[1];
				}
			} else {
				var slope = (position[0] - center[0]) / (position[1] - center[1]);
				var bottom = position[1] > center[1];
				if (bottom) {
					var y = box.inner.y + box.inner.height;
					var x = (y - position[1]) * slope + position[0];
				} else {
					var y = box.inner.y;
					var x = (position[1] - y) * -slope + position[0];
				}
			}
			var offset = [position[0] - x, position[1] - y];
			var outside = position[0] < box.inner.x
				|| position[0] > box.inner.x + box.inner.width
				|| position[1] < box.inner.y
				|| position[1] > box.inner.y + box.inner.height;
			offset = offset.map(o => o * options[outside ? 'edgeForce' : 'centerForce']);
			var distance = Math.sqrt(offset[0] ** 2 + offset[1] ** 2);
			offset = offset.map(o => o * -Math.min(1, options.maxForce / distance));

			if (mouseDown) {
				physicsObject.position = [mouseX, mouseY];
				for (let i = 1; i < positionHistory.length; i++) {
					slopeAverage[i - 1] = [
						positionHistory[i][0] - positionHistory[i - 1][0],
						positionHistory[i][1] - positionHistory[i - 1][1],
					];
				}
				physicsObject.velocity[0] = slopeAverage.reduce((a, b) => a + b[0], 0) / slopeAverage.length;
				physicsObject.velocity[1] = slopeAverage.reduce((a, b) => a + b[1], 0) / slopeAverage.length;
			} else {
				physicsObject.velocity[0] += offset[0];
				physicsObject.velocity[1] += offset[1];
			}

			ctx.fillStyle = '#ff00ff';
			ctx.fillRect(physicsObject.position[0], physicsObject.position[1], 10, 10);

			physicsObject.position[0] += physicsObject.velocity[0];
			physicsObject.position[1] += physicsObject.velocity[1];
			physicsObject.velocity[0] *= 1 - options.friction;
			physicsObject.velocity[1] *= 1 - options.friction;

			requestAnimationFrame(draw);
		}
		draw();

		function onresize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		onresize();
		window.addEventListener('resize', onresize);
		canvas.addEventListener('mousemove', e => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			mouseDown = (e.buttons & (1 << 0)) > 0;
		});
	}, []);
	return <div className='fullscreenControls posabs a0'>
		<canvas ref={canvasRef} />
		<div className='menuBar'>
		</div>
	</div>;
}
