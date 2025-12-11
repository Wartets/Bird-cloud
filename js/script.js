const canvas = document.getElementById('birdsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let NUM_BIRDS = 2000;
let MAX_SPEED = 20;
let MAX_FORCE = 0.84;
let VISION_RADIUS = 17;
let AVOID_RADIUS = 30;
let bird_color = false;
let MAX_FATIGUE = 6;
let MISCONDUCT = 0.3;

let cursorHidden = false;
let inactivityTimeout;

let birds = []; 
let birdPaths = {};
let currentBirdIndex = -1;

const CAPACITY = 60000;
let activeCount = NUM_BIRDS;

const b_x = new Float32Array(CAPACITY);
const b_y = new Float32Array(CAPACITY);
const b_vx = new Float32Array(CAPACITY);
const b_vy = new Float32Array(CAPACITY);
const b_ax = new Float32Array(CAPACITY);
const b_ay = new Float32Array(CAPACITY);
const b_fatigue = new Float32Array(CAPACITY);
const b_size = new Float32Array(CAPACITY);
const b_stray = new Float32Array(CAPACITY);
const b_r = new Uint8Array(CAPACITY);
const b_g = new Uint8Array(CAPACITY);
const b_b = new Uint8Array(CAPACITY);
const b_colorStr = new Array(CAPACITY);

const controlsToggle = document.getElementById('controls-toggle');
const controlsWindow = document.getElementById('controls-window');
const numBirdsSlider = document.getElementById('num-birds');
const maxSpeedSlider = document.getElementById('max-speed');
const maxForceSlider = document.getElementById('max-force');
const visionRadiusSlider = document.getElementById('vision-radius');
const avoidRadiusSlider = document.getElementById('avoid-radius');
const maxFatigueSlider = document.getElementById('max-fatigue');
const misconductSlider = document.getElementById('misconduct');

const numBirdsLabel = document.getElementById('num-birds-label');
const maxSpeedLabel = document.getElementById('max-speed-label');
const maxForceLabel = document.getElementById('max-force-label');
const visionRadiusLabel = document.getElementById('vision-radius-label');
const avoidRadiusLabel = document.getElementById('avoid-radius-label');
const maxFatigueLabel = document.getElementById('max-fatigue-label');
const misconductLabel = document.getElementById('misconduct-label');

const colorCohesionCheckbox = document.getElementById('color-cohesion-checkbox');
colorCohesionCheckbox.addEventListener('change', () => {
	bird_color = colorCohesionCheckbox.checked;
});

let canClick = true;

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

canvas.addEventListener('click', (event) => {
	if (!canClick) return;

	canClick = false;
	setTimeout(() => canClick = true, 500);
	const x = event.clientX;
	const y = event.clientY;

	let clickedIndex = -1;
	for (let i = 0; i < activeCount; i++) {
		const dx = x - b_x[i];
		const dy = y - b_y[i];
		if (dx * dx + dy * dy < b_size[i] * 4 * b_size[i]) {
			clickedIndex = i;
			break;
		}
	}

	if (clickedIndex !== -1) {
		if (currentBirdIndex === clickedIndex) {
			if (b_colorStr[clickedIndex]) birdPaths[b_colorStr[clickedIndex]] = [];
			currentBirdIndex = -1;
		} else {
			if (currentBirdIndex !== -1) {
				birdPaths[b_colorStr[currentBirdIndex]] = [];
			}
			currentBirdIndex = clickedIndex;
			birdPaths[b_colorStr[currentBirdIndex]] = [{ x: b_x[currentBirdIndex], y: b_y[currentBirdIndex] }];
		}
	} else {
		if (currentBirdIndex !== -1) {
			birdPaths[b_colorStr[currentBirdIndex]] = [];
			currentBirdIndex = -1;
		}
	}
});

controlsToggle.addEventListener('click', () => {
	controlsWindow.classList.toggle('show');
});

const readmeButton = document.getElementById('readme-toggle');
const readmeWindow = document.getElementById('readme-window');

readmeButton.addEventListener('click', () => {
	readmeWindow.classList.toggle('show');
});

function hideCursor() {
	document.body.style.cursor = 'none';
	cursorHidden = true;
}

function showCursor() {
	document.body.style.cursor = 'auto';
	cursorHidden = false;
}

canvas.addEventListener('mousemove', () => {
	if (cursorHidden) {
		showCursor();
	}
	clearTimeout(inactivityTimeout);
	inactivityTimeout = setTimeout(hideCursor, 5000);
});

numBirdsLabel.innerText = NUM_BIRDS;
maxSpeedLabel.innerText = MAX_SPEED;
maxForceLabel.innerText = MAX_FORCE;
visionRadiusLabel.innerText = VISION_RADIUS;
avoidRadiusLabel.innerText = AVOID_RADIUS;
maxFatigueLabel.innerText = MAX_FATIGUE;
misconductLabel.innerText = MISCONDUCT;

numBirdsSlider.addEventListener('input', () => {
	const newNum = parseInt(numBirdsSlider.value, 10);
	numBirdsLabel.innerText = newNum;

	if (newNum > activeCount) {
		for (let i = activeCount; i < newNum; i++) {
			initBird(i, Math.random() * canvas.width, Math.random() * canvas.height);
		}
	}
	activeCount = newNum;
});

maxSpeedSlider.addEventListener('input', () => {
	MAX_SPEED = parseFloat(maxSpeedSlider.value);
	maxSpeedLabel.innerText = MAX_SPEED.toFixed(1);
});

maxForceSlider.addEventListener('input', () => {
	MAX_FORCE = parseFloat(maxForceSlider.value);
	maxForceLabel.innerText = MAX_FORCE.toFixed(2);
});

visionRadiusSlider.addEventListener('input', () => {
	VISION_RADIUS = parseInt(visionRadiusSlider.value, 10);
	visionRadiusLabel.innerText = VISION_RADIUS;
});

avoidRadiusSlider.addEventListener('input', () => {
	AVOID_RADIUS = parseInt(avoidRadiusSlider.value, 10);
	avoidRadiusLabel.innerText = AVOID_RADIUS;
});

maxFatigueSlider.addEventListener('input', () => {
	MAX_FATIGUE = parseFloat(maxFatigueSlider.value);
	maxFatigueLabel.innerText = MAX_FATIGUE.toFixed(1);
});

misconductSlider.addEventListener('input', () => {
	MISCONDUCT = parseFloat(misconductSlider.value);
	misconductLabel.innerText = MISCONDUCT.toFixed(2);
});

class SpatialGrid {
	constructor(width, height, cellSize) {
		this.cellSize = cellSize;
		this.width = width;
		this.height = height;
		this.cols = Math.ceil(width / cellSize);
		this.rows = Math.ceil(height / cellSize);
		this.numCells = this.cols * this.rows;
		this.heads = new Int32Array(this.numCells);
		this.next = new Int32Array(CAPACITY);
	}

	resize(capacity) {
		const newNext = new Int32Array(capacity);
		newNext.set(this.next);
		this.next = newNext;
	}

	clear() {
		this.heads.fill(-1);
	}

	add(birdIndex, x, y) {
		const col = (x / this.cellSize) | 0;
		const row = (y / this.cellSize) | 0;
		const cellIndex = row * this.cols + col;
		this.next[birdIndex] = this.heads[cellIndex];
		this.heads[cellIndex] = birdIndex;
	}
	
	setup(width, height, cellSize) {
		this.width = width;
		this.height = height;
		this.cellSize = cellSize;
		this.cols = Math.ceil(width / cellSize);
		this.rows = Math.ceil(height / cellSize);
		this.numCells = this.cols * this.rows;
		if (this.heads.length < this.numCells) {
			this.heads = new Int32Array(this.numCells);
		}
	}
}

function initBird(i, x, y) {
	b_x[i] = x;
	b_y[i] = y;
	b_vx[i] = - Math.random() * 2 - 1;
	b_vy[i] = Math.random() * 2 - 1;
	b_ax[i] = 0;
	b_ay[i] = 0;
	b_fatigue[i] = 0;
	
	let c = 0;
	if (bird_color) {
		c = Math.floor(Math.random() * 16777215 / 2.5);
	} else {
		c = Math.floor(Math.random() * 16777215);
	}
	
	b_colorStr[i] = '#' + c.toString(16).padStart(6, '0');

	b_r[i] = (c >> 16) & 255;
	b_g[i] = (c >> 8) & 255;
	b_b[i] = c & 255;

	b_size[i] = 4.5 - 0.8 * Math.random();
	b_stray[i] = Math.random() * 0.01 * (b_size[i] / 4.5);
}

function updateFlock(spatialGrid) {
	const w = canvas.width;
	const h = canvas.height;
	const wHalf = w * 0.5;
	const hHalf = h * 0.5;
	const visionSq = VISION_RADIUS * VISION_RADIUS;
	const avoidSq = AVOID_RADIUS * AVOID_RADIUS;
	const gridCols = spatialGrid.cols;
	const gridRows = spatialGrid.rows;
	const maxForceSq = MAX_FORCE * MAX_FORCE;
	const speedLimit = bird_color ? MAX_SPEED * 2 : MAX_SPEED;
	const speedLimitSq = speedLimit * speedLimit;
	const cellSz = spatialGrid.cellSize;

	for (let i = 0; i < activeCount; i++) {
		let alignX = 0, alignY = 0;
		let cohX = 0, cohY = 0;
		let sepX = 0, sepY = 0;
		let alignCount = 0, cohCount = 0, sepCount = 0;

		const myX = b_x[i];
		const myY = b_y[i];

		const col = (myX / cellSz) | 0;
		const row = (myY / cellSz) | 0;

		for (let cy = -1; cy <= 1; cy++) {
			let neighborRow = row + cy;
			if (neighborRow < 0) neighborRow += gridRows;
			else if (neighborRow >= gridRows) neighborRow -= gridRows;
			const rowOffset = neighborRow * gridCols;

			for (let cx = -1; cx <= 1; cx++) {
				let neighborCol = col + cx;
				if (neighborCol < 0) neighborCol += gridCols;
				else if (neighborCol >= gridCols) neighborCol -= gridCols;

				let otherIndex = spatialGrid.heads[rowOffset + neighborCol];

				while (otherIndex !== -1) {
					if (otherIndex !== i) {
						let isCompatible = true;
						if (bird_color) {
							const rDiff = b_r[i] - b_r[otherIndex];
							const gDiff = b_g[i] - b_g[otherIndex];
							const bDiff = b_b[i] - b_b[otherIndex];
							if ((rDiff * rDiff + gDiff * gDiff + bDiff * bDiff) > 2500) isCompatible = false;
						}

						if (isCompatible) {
							let dx = b_x[otherIndex] - myX;
							let dy = b_y[otherIndex] - myY;

							if (dx > wHalf) dx -= w;
							else if (dx < -wHalf) dx += w;
							if (dy > hHalf) dy -= h;
							else if (dy < -hHalf) dy += h;

							const dSq = dx * dx + dy * dy;

							if (dSq < visionSq) {
								if (dSq < avoidSq && dSq > 0) {
									const d = Math.sqrt(dSq);
									const force = 1 / d;
									sepX -= dx * force;
									sepY -= dy * force;
									sepCount++;
								}
								alignX += b_vx[otherIndex];
								alignY += b_vy[otherIndex];
								alignCount++;
								cohX += dx;
								cohY += dy;
								cohCount++;
							}
						}
					}
					otherIndex = spatialGrid.next[otherIndex];
				}
			}
		}

		if (sepCount > 0) {
			const magSq = sepX * sepX + sepY * sepY;
			if (magSq > maxForceSq) {
				const mul = MAX_FORCE / Math.sqrt(magSq);
				sepX *= mul;
				sepY *= mul;
			}
			b_ax[i] += sepX;
			b_ay[i] += sepY;
		}

		if (alignCount > 0) {
			const invAlign = 1 / alignCount;
			alignX = (alignX * invAlign) - b_vx[i];
			alignY = (alignY * invAlign) - b_vy[i];
			const magSq = alignX * alignX + alignY * alignY;
			if (magSq > maxForceSq) {
				const mul = MAX_FORCE / Math.sqrt(magSq);
				alignX *= mul;
				alignY *= mul;
			}
			b_ax[i] += alignX;
			b_ay[i] += alignY;
		}

		if (cohCount > 0) {
			const invCoh = 1 / cohCount;
			cohX *= invCoh;
			cohY *= invCoh;
			const fatigueFactor = 1 - b_fatigue[i] * 0.1;
			cohX *= fatigueFactor;
			cohY *= fatigueFactor;
			const magSq = cohX * cohX + cohY * cohY;
			if (magSq > maxForceSq) {
				const mul = MAX_FORCE / Math.sqrt(magSq);
				cohX *= mul;
				cohY *= mul;
			}
			b_ax[i] += cohX;
			b_ay[i] += cohY;
		}

		if (Math.random() < b_stray[i]) {
			b_ax[i] += (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1);
			b_ay[i] += (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1);
		}

		b_vx[i] += b_ax[i];
		b_vy[i] += b_ay[i];

		const vMagSq = b_vx[i] * b_vx[i] + b_vy[i] * b_vy[i];
		if (vMagSq > speedLimitSq) {
			const mag = Math.sqrt(vMagSq);
			const mul = speedLimit / mag;
			b_vx[i] *= mul;
			b_vy[i] *= mul;
		}

		b_x[i] += b_vx[i];
		b_y[i] += b_vy[i];
		b_ax[i] = 0;
		b_ay[i] = 0;

		if (b_x[i] >= w) b_x[i] = 0;
		else if (b_x[i] < 0) b_x[i] = w;
		if (b_y[i] >= h) b_y[i] = 0;
		else if (b_y[i] < 0) b_y[i] = h;

		const speedVal = Math.sqrt(b_vx[i] * b_vx[i] + b_vy[i] * b_vy[i]);
		b_fatigue[i] += speedVal * 0.01;
		if (b_fatigue[i] > MAX_FATIGUE) {
			b_vx[i] *= 0.95;
			b_vy[i] *= 0.95;
			b_fatigue[i] -= 0.1 / (b_size[i] / 4.5);
		}
		if (b_fatigue[i] < 0) b_fatigue[i] = 0;
		else if (b_fatigue[i] > 10) b_fatigue[i] = 10;
	}
}

function drawFlock() {
	if (activeCount > 3000) {
		for (let i = 0; i < activeCount; i++) {
			ctx.fillStyle = b_colorStr[i];
			ctx.fillRect(b_x[i], b_y[i], b_size[i] * 0.6, b_size[i] * 0.6);
		}
	} else {
		for (let i = 0; i < activeCount; i++) {
			const vx = b_vx[i];
			const vy = b_vy[i];
			const x = b_x[i];
			const y = b_y[i];
			const s = b_size[i];
			
			let cos = vx; 
			let sin = vy;
			const mag = Math.abs(vx) + Math.abs(vy); 
			if (mag > 0.01) {
				const inv = 1 / mag; 
				cos *= inv;
				sin *= inv;
			} else {
				cos = 1; sin = 0;
			}
	
			const halfS = s * 0.5;
			const headX = x + cos * s;
			const headY = y + sin * s;
			const sideX = -cos * s;
			const sideY = -sin * s;
			const perpX = sin * halfS;
			const perpY = -cos * halfS;
	
			ctx.fillStyle = b_colorStr[i];
			ctx.beginPath();
			ctx.moveTo(headX, headY);
			ctx.lineTo(x + sideX + perpX, y + sideY + perpY);
			ctx.lineTo(x + sideX - perpX, y + sideY - perpY);
			ctx.fill();
		}
	}
}

function updateBirdPaths() {
	if (currentBirdIndex !== -1 && currentBirdIndex < activeCount) {
		birdPaths[b_colorStr[currentBirdIndex]].push({ x: b_x[currentBirdIndex], y: b_y[currentBirdIndex] });
	}
}

function drawPaths() {
	for (let color in birdPaths) {
		const path = birdPaths[color];
		if (path.length > 1) {
			ctx.beginPath();
			ctx.moveTo(path[0].x, path[0].y);
			for (let i = 1; i < path.length; i++) {
				const prevPoint = path[i - 1];
				const currentPoint = path[i];

				const dx = Math.abs(currentPoint.x - prevPoint.x);
				const dy = Math.abs(currentPoint.y - prevPoint.y);
				
				if (dx > canvas.width / 2 || dy > canvas.height / 2) {
					ctx.moveTo(currentPoint.x, currentPoint.y);
				} else {
					ctx.lineTo(currentPoint.x, currentPoint.y);
				}
			}
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();
		}
	}
}

for (let i = 0; i < NUM_BIRDS; i++) {
	initBird(i, Math.random() * canvas.width, Math.random() * canvas.height);
}

let spatialGrid = new SpatialGrid(canvas.width, canvas.height, Math.max(VISION_RADIUS, AVOID_RADIUS));

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	updateBirdPaths();
	drawPaths();

	const maxRadius = Math.max(VISION_RADIUS, AVOID_RADIUS);
	if (spatialGrid.cellSize !== maxRadius || 
		spatialGrid.width !== canvas.width || 
		spatialGrid.height !== canvas.height) {
		spatialGrid.setup(canvas.width, canvas.height, maxRadius);
	}

	spatialGrid.clear();
	
	for (let i = 0; i < activeCount; i++) {
		spatialGrid.add(i, b_x[i], b_y[i]);
	}

	updateFlock(spatialGrid);
	drawFlock();

	requestAnimationFrame(animate);
}

animate();