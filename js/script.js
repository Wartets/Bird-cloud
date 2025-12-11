const canvas = document.getElementById('birdsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let NUM_BIRDS = 100;
let MAX_SPEED = 3;
let MAX_FORCE = 0.05;
let VISION_RADIUS = 40;
let AVOID_RADIUS = 30;
let bird_color = false;
let MAX_FATIGUE = 6;
let MISCONDUCT = 1;

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

canvas.addEventListener('click', (event) => {
	if (!canClick) return;

	canClick = false;
	setTimeout(() => canClick = true, 500);
	const x = event.clientX;
	const y = event.clientY;

	let birdClicked = null;
	for (let bird of birds) {
		if (dist({x, y}, bird.position) < bird.size * 2) {
			birdClicked = bird;
			break;
		}
	}

	if (birdClicked) {
		if (currentBird === birdClicked) {
			birdPaths[birdClicked.color] = [];
			currentBird = null;
		} else {
			if (currentBird) {
				birdPaths[currentBird.color] = [];
			}
			currentBird = birdClicked;
			birdPaths[currentBird.color] = [{ x: currentBird.position.x, y: currentBird.position.y }];
		}
	} else {
		if (currentBird) {
			birdPaths[currentBird.color] = [];
			currentBird = null;
		}
	}
});

controlsToggle.addEventListener('click', () => {
	controlsWindow.classList.toggle('show');
});

const readmeButton = document.getElementById('readme-toggle');
const readmeWindow = document.getElementById('readme-window');

const readmeContent = `
	<h2>Simulation de Nuée d'Oiseaux</h2>
	<p>Ce projet est une simulation interactive basée sur le modèle des <strong>boids</strong>, illustrant le comportement collectif des oiseaux en vol. Il est basé sur trois règles de base :</p>
	<ul>
		<li><strong>Cohésion :</strong> Les oiseaux se rapprochent du centre de masse des voisins.</li>
		<li><strong>Séparation :</strong> Ils évitent les collisions avec leurs congénères.</li>
		<li><strong>Alignement :</strong> Ils suivent la direction moyenne des voisins.</li>
	</ul>
`;

readmeWindow.innerHTML = readmeContent;

readmeButton.addEventListener('click', () => {
	readmeWindow.classList.toggle('show');
});

let cursorHidden = false;
let inactivityTimeout;

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
	inactivityTimeout = setTimeout(hideCursor, 3900);
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

	const difference = newNum - birds.length;
	if (difference > 0) {
		for (let i = 0; i < difference; i++) {
			birds.push(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
		}
	} else if (difference < 0) {
		birds = birds.slice(0, newNum);
	}
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

let birds = [];
let birdPaths = {};
let currentBird = null;

class SpatialGrid {
	constructor(width, height, cellSize) {
		this.cellSize = cellSize;
		this.cols = Math.ceil(width / cellSize);
		this.rows = Math.ceil(height / cellSize);
		this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
	}

	clear() {
		for (let i = 0; i < this.grid.length; i++) {
			this.grid[i].length = 0;
		}
	}

	add(bird) {
		const col = Math.floor(bird.position.x / this.cellSize);
		const row = Math.floor(bird.position.y / this.cellSize);
		const index = (row * this.cols) + col;
		if (this.grid[index]) {
			this.grid[index].push(bird);
		}
	}

	getNeighbors(bird) {
		const col = Math.floor(bird.position.x / this.cellSize);
		const row = Math.floor(bird.position.y / this.cellSize);
		let neighbors = [];

		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				let neighborCol = (col + i + this.cols) % this.cols;
				let neighborRow = (row + j + this.rows) % this.rows;
				const index = (neighborRow * this.cols) + neighborCol;
				
				if (this.grid[index]) {
					const cellBirds = this.grid[index];
					for (let k = 0; k < cellBirds.length; k++) {
						neighbors.push(cellBirds[k]);
					}
				}
			}
		}
		return neighbors;
	}
}

class Bird {
	constructor(x, y) {
        this.position = { x: x, y: y };
        this.velocity = { x: - Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.acceleration = { x: 0, y: 0 };
		this.fatigue = 0;
		if (bird_color) {
			this.color = '#' + Math.floor(Math.random() * 16777215 / 2.5).toString(16)
		}
		else {
			this.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
		}
		while (this.color.length < 7) { this.color += '0'; }
		this.rgb = hexToRgb(this.color); 

		this.size = 4.5 - 0.8 * Math.random()
		this.strayChance = Math.random() * 0.01 * (this.size / 4.5)
    }
	
	sameColorBirds(birds) {
		const threshold = 50;
		return birds.filter(bird => colorDistance(this.color, bird.color) < threshold);
	}

	applyForce(force) {
		this.acceleration.x += force.x;
		this.acceleration.y += force.y;
	}

	update() {
		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;

		if (bird_color) {
			this.velocity = limit(this.velocity, MAX_SPEED * 2);
		}
		else {
			this.velocity = limit(this.velocity, MAX_SPEED);
		}

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		this.acceleration = { x: 0, y: 0 };

		if (this.position.x > canvas.width) this.position.x = 0;
		if (this.position.x < 0) this.position.x = canvas.width;
		if (this.position.y > canvas.height) this.position.y = 0;
		if (this.position.y < 0) this.position.y = canvas.height;
		
		this.fatigue += Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) * 0.01;

		if (this.fatigue > MAX_FATIGUE) {
			this.velocity.x *= 0.95;
			this.velocity.y *= 0.95;

			this.fatigue -= 0.1 / (this.size / 4.5);
		}

		this.fatigue = Math.max(0, Math.min(this.fatigue, 10));
	}

	draw() {
		const angle = Math.atan2(this.velocity.y, this.velocity.x);
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(angle);
		ctx.beginPath();
		ctx.moveTo(this.size, 0);
		ctx.lineTo(-this.size, this.size/2);
		ctx.lineTo(-this.size, -this.size/2);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}

	cohesion(neighbors) {
		let total = 0;
		let centerX = 0;
		let centerY = 0;
		const rSq = VISION_RADIUS * VISION_RADIUS;
		const w = canvas.width;
		const h = canvas.height;

		if (Math.random() < this.strayChance) {
			return {
				x: (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1),
				y: (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1),
			};
		}

		for (let i = 0; i < neighbors.length; i++) {
			const other = neighbors[i];
			if (other === this) continue;

			if (bird_color) {
				const rDiff = this.rgb.r - other.rgb.r;
				const gDiff = this.rgb.g - other.rgb.g;
				const bDiff = this.rgb.b - other.rgb.b;
				if ((rDiff * rDiff + gDiff * gDiff + bDiff * bDiff) > 2500) continue;
			}

			let dx = other.position.x - this.position.x;
			let dy = other.position.y - this.position.y;

			if (dx > w * 0.5) dx -= w;
			else if (dx < -w * 0.5) dx += w;
			if (dy > h * 0.5) dy -= h;
			else if (dy < -h * 0.5) dy += h;

			if ((dx * dx + dy * dy) < rSq) {
				centerX += (this.position.x + dx);
				centerY += (this.position.y + dy);
				total++;
			}
		}

		if (total > 0) {
			centerX /= total;
			centerY /= total;
			
			const desiredX = centerX - this.position.x;
			const desiredY = centerY - this.position.y;
			
			const fatigueFactor = 1 - this.fatigue / 10;
			
			const mag = Math.sqrt(desiredX * desiredX + desiredY * desiredY);
			if (mag > 0) {
				return limit({
					x: desiredX * fatigueFactor,
					y: desiredY * fatigueFactor
				}, MAX_FORCE);
			}
		}
		return { x: 0, y: 0 };
	}


	separation(neighbors) {
        let total = 0;
        let steerX = 0;
        let steerY = 0;
		const rSq = AVOID_RADIUS * AVOID_RADIUS;
		const w = canvas.width;
		const h = canvas.height;

		for (let i = 0; i < neighbors.length; i++) {
			const other = neighbors[i];
			if (other === this) continue;

			if (bird_color) {
				const rDiff = this.rgb.r - other.rgb.r;
				const gDiff = this.rgb.g - other.rgb.g;
				const bDiff = this.rgb.b - other.rgb.b;
				if ((rDiff * rDiff + gDiff * gDiff + bDiff * bDiff) > 2500) continue;
			}

			let dx = this.position.x - other.position.x;
			let dy = this.position.y - other.position.y;

			if (dx > w * 0.5) dx -= w;
			else if (dx < -w * 0.5) dx += w;
			if (dy > h * 0.5) dy -= h;
			else if (dy < -h * 0.5) dy += h;

			const dSq = dx * dx + dy * dy;

			if (dSq > 0 && dSq < rSq) {
				const d = Math.sqrt(dSq);
				steerX += dx / d; 
				steerY += dy / d;
				total++;
			}
		}

        if (total > 0) {
            steerX /= total;
            steerY /= total;
            return limit({ x: steerX, y: steerY }, MAX_FORCE);
        }
        return { x: 0, y: 0 };
    }

	alignment(neighbors) {
        let total = 0;
        let avgVX = 0;
        let avgVY = 0;
		const rSq = VISION_RADIUS * VISION_RADIUS;
		const w = canvas.width;
		const h = canvas.height;

		for (let i = 0; i < neighbors.length; i++) {
			const other = neighbors[i];
			if (other === this) continue;

			if (bird_color) {
				const rDiff = this.rgb.r - other.rgb.r;
				const gDiff = this.rgb.g - other.rgb.g;
				const bDiff = this.rgb.b - other.rgb.b;
				if ((rDiff * rDiff + gDiff * gDiff + bDiff * bDiff) > 2500) continue;
			}

			let dx = other.position.x - this.position.x;
			let dy = other.position.y - this.position.y;

			if (dx > w * 0.5) dx -= w;
			else if (dx < -w * 0.5) dx += w;
			if (dy > h * 0.5) dy -= h;
			else if (dy < -h * 0.5) dy += h;

			if ((dx * dx + dy * dy) < rSq) {
				avgVX += other.velocity.x;
				avgVY += other.velocity.y;
				total++;
			}
		}

        if (total > 0) {
            avgVX /= total;
            avgVY /= total;
            const desired = {
                x: avgVX - this.velocity.x,
                y: avgVY - this.velocity.y,
            };
            return limit(desired, MAX_FORCE);
        }
        return { x: 0, y: 0 };
    }
}

function updateBirdPaths() {
	if (currentBird) {
		birdPaths[currentBird.color].push({ x: currentBird.position.x, y: currentBird.position.y });
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
				const teleported = dx > canvas.width / 2 || dy > canvas.height / 2;

				if (teleported) {
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

function colorDistance(rgb1, rgb2) {
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function hexToRgb(hex) {
	let r = parseInt(hex.substr(1, 2), 16);
	let g = parseInt(hex.substr(3, 2), 16);
	let b = parseInt(hex.substr(5, 2), 16);
	return { r, g, b };
}

function dist(a, b) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function limit(vector, max) {
	const mag = Math.sqrt(vector.x ** 2 + vector.y ** 2);
	if (mag > max) {
		vector.x = (vector.x / mag) * max;
		vector.y = (vector.y / mag) * max;
	}
	return vector;
}

for (let i = 0; i < NUM_BIRDS; i++) {
	birds.push(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
}

let spatialGrid = new SpatialGrid(canvas.width, canvas.height, Math.max(VISION_RADIUS, AVOID_RADIUS));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	updateBirdPaths();
	drawPaths();

	const maxRadius = Math.max(VISION_RADIUS, AVOID_RADIUS);
	if (spatialGrid.cellSize !== maxRadius || spatialGrid.grid.length === 0) {
		spatialGrid = new SpatialGrid(canvas.width, canvas.height, maxRadius);
	}

	spatialGrid.clear();
	for (let bird of birds) {
		spatialGrid.add(bird);
	}

    for (let bird of birds) {
		const neighbors = spatialGrid.getNeighbors(bird);

        const cohesionForce = bird.cohesion(neighbors);
        const separationForce = bird.separation(neighbors);
        const alignmentForce = bird.alignment(neighbors);

        bird.applyForce(cohesionForce);
        bird.applyForce(separationForce);
        bird.applyForce(alignmentForce);
		
        bird.update();
        bird.draw();
    }

    requestAnimationFrame(animate);
}

animate();