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
		margin: 100, // screen margin
		friction: 0.0, // friction
		edgeForce: 1.0, // force outside margin (inwards to edges)
		centerForce: 0.6, // force inside margin (outwards to edges)
		maxForce: 50, // limit force to not go over this value
		doneTolerance: 0.5, // if movement per frame goes below this value the animation is considered done
	};

	useEffect(() => {
		var canvas = canvasRef.current as HTMLCanvasElement;
		var ctx = canvas.getContext('2d');

		function line([x1, y1]: [number, number], [x2, y2]: [number, number]) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}

		var mouseX = 0;
		var mouseY = 0;

		function draw() {
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

			ctx.strokeStyle = '#ff00ff';

			var center = findCenter(mouseX, mouseY);
			var mouse = [mouseX, mouseY];
			// line(center, mouse as [ number, number ]);

			var slope = (mouse[1] - center[1]) / (mouse[0] - center[0]);
			if (Math.abs(slope) < 1) {
				var right = mouse[0] > center[0];
				if (right) {
					var x = box.inner.x + box.inner.width;
					var y = (x - mouseX) * slope + mouseY;
				} else {
					var x = box.inner.x;
					var y = (mouseX - x) * -slope + mouseY;
				}
			} else {
				var slope = (mouse[0] - center[0]) / (mouse[1] - center[1]);
				var bottom = mouse[1] > center[1];
				if (bottom) {
					var y = box.inner.y + box.inner.height;
					var x = (y - mouseY) * slope + mouseX;
				} else {
					var y = box.inner.y;
					var x = (mouseY - y) * -slope + mouseX;
				}
			}
			var offset = [mouse[0] - x, mouse[1] - y];
			var outside = mouse[0] < box.inner.x
				|| mouse[0] > box.inner.x + box.inner.width
				|| mouse[1] < box.inner.y
				|| mouse[1] > box.inner.y + box.inner.height;
			offset = offset.map(o => o * options[outside ? 'edgeForce' : 'centerForce']);
			var distance = Math.sqrt(offset[0] ** 2 + offset[1] ** 2);
			offset = offset.map(o => o * -Math.min(1, options.maxForce / distance));

			ctx.strokeStyle = '#ff0000';
			line([mouseX + offset[0], mouseY + offset[1]], [mouseX, mouseY]);

			ctx.strokeStyle = '#00ffff';

			line([box.inner.x, box.inner.y], [box.inner.x + box.inner.width, box.inner.y]);
			line([box.inner.x + box.inner.width, box.inner.y + box.inner.height], [
				box.inner.x + box.inner.width,
				box.inner.y,
			]);
			line([box.inner.x, box.inner.y + box.inner.height], [
				box.inner.x + box.inner.width,
				box.inner.y + box.inner.height,
			]);
			line([box.inner.x, box.inner.y], [box.inner.x, box.inner.y + box.inner.height]);

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
		});
	}, []);
	return <div className='fullscreenControls posabs a0'>
		<canvas ref={canvasRef} />
		<div className='menuBar'>
		</div>
	</div>;
}
