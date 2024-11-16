// Configuration globale
const canvas = document.getElementById('birdsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Définition des constantes et des sliders
let NUM_BIRDS = 100;
let MAX_SPEED = 3;
let MAX_FORCE = 0.05;
let VISION_RADIUS = 40;
let AVOID_RADIUS = 30;

const controlsToggle = document.getElementById('controls-toggle');
const controlsWindow = document.getElementById('controls-window');
const numBirdsSlider = document.getElementById('num-birds');
const maxSpeedSlider = document.getElementById('max-speed');
const maxForceSlider = document.getElementById('max-force');
const visionRadiusSlider = document.getElementById('vision-radius');
const avoidRadiusSlider = document.getElementById('avoid-radius');

const numBirdsLabel = document.getElementById('num-birds-label');
const maxSpeedLabel = document.getElementById('max-speed-label');
const maxForceLabel = document.getElementById('max-force-label');
const visionRadiusLabel = document.getElementById('vision-radius-label');
const avoidRadiusLabel = document.getElementById('avoid-radius-label');

controlsToggle.addEventListener('click', () => {
    controlsWindow.style.display = controlsWindow.style.display === 'none' ? 'block' : 'none';
});

numBirdsLabel.innerText = NUM_BIRDS;
maxSpeedLabel.innerText = MAX_SPEED;
maxForceLabel.innerText = MAX_FORCE;
visionRadiusLabel.innerText = VISION_RADIUS;
avoidRadiusLabel.innerText = AVOID_RADIUS;

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
    maxSpeedLabel.innerText = MAX_SPEED.toFixed(2);
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

let birds = [];

// Classe Bird
class Bird {
    constructor(x, y) {
        this.position = { x: x, y: y };
        this.velocity = { x: - Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.acceleration = { x: 0, y: 0 };
		this.fatigue = 0;
		this.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
		this.size = 4.5 - 0.8 * Math.random()
		this.strayChance = Math.random() * 0.01 * (this.size / 4.5)
    }

    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }

    update() {
        // Mise à jour de la vitesse et position
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Limiter la vitesse
        this.velocity = limit(this.velocity, MAX_SPEED);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Réinitialiser l'accélération
        this.acceleration = { x: 0, y: 0 };

        // Gestion des bordures (tore)
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
		
		this.fatigue += Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) * 0.01;

		// Si la fatigue dépasse un seuil, ralentir
		if (this.fatigue > 6) {
			this.velocity.x *= 0.95;
			this.velocity.y *= 0.95;

			// Réduire lentement la fatigue pendant que l'oiseau ralentit
			this.fatigue -= 0.1 / (this.size / 4.5);
		}

		// S'assurer que la fatigue reste dans des limites acceptables
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

    // Règles de birds
    cohesion(birds) {
        let total = 0;
        let center = { x: 0, y: 0 };

        for (let Bird of birds) {
            const distance = dist(this.position, Bird.position);
            if (Bird !== this && distance < VISION_RADIUS) {
                center.x += Bird.position.x;
                center.y += Bird.position.y;
                total++;
            }
        }

		// Éloignement aléatoire
		if (Math.random() < this.strayChance) {
			return {
				x: Math.random() * 4 - 1, // Mouvement aléatoire
				y: Math.random() * 4 - 1,
			};
		}

        if (total > 0) {
            center.x /= total;
            center.y /= total;
            const desired = {
                x: center.x - this.position.x,
                y: center.y - this.position.y,
            };
			return limit({
				x: desired.x * (1 - this.fatigue / 10),
				y: desired.y * (1 - this.fatigue / 10),
			}, MAX_FORCE);
        }
        return { x: 0, y: 0 };
    }

    separation(birds) {
        let total = 0;
        let steer = { x: 0, y: 0 };

        for (let Bird of birds) {
            const distance = dist(this.position, Bird.position);
            if (Bird !== this && distance < AVOID_RADIUS) {
                const diff = {
                    x: this.position.x - Bird.position.x,
                    y: this.position.y - Bird.position.y,
                };
                steer.x += diff.x / distance;
                steer.y += diff.y / distance;
                total++;
            }
        }

        if (total > 0) {
            steer.x /= total;
            steer.y /= total;
            return limit(steer, MAX_FORCE);
        }
        return { x: 0, y: 0 };
    }

    alignment(birds) {
        let total = 0;
        let avgVelocity = { x: 0, y: 0 };

        for (let Bird of birds) {
            const distance = dist(this.position, Bird.position);
            if (Bird !== this && distance < VISION_RADIUS) {
                avgVelocity.x += Bird.velocity.x;
                avgVelocity.y += Bird.velocity.y;
                total++;
            }
        }

        if (total > 0) {
            avgVelocity.x /= total;
            avgVelocity.y /= total;
            const desired = {
                x: avgVelocity.x - this.velocity.x,
                y: avgVelocity.y - this.velocity.y,
            };
            return limit(desired, MAX_FORCE);
        }
        return { x: 0, y: 0 };
    }
}

// Utilitaires
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

// Initialisation
for (let i = 0; i < NUM_BIRDS; i++) {
    birds.push(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Boucle d'animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let Bird of birds) {
        const cohesionForce = Bird.cohesion(birds);
        const separationForce = Bird.separation(birds);
        const alignmentForce = Bird.alignment(birds);

        Bird.applyForce(cohesionForce);
        Bird.applyForce(separationForce);
        Bird.applyForce(alignmentForce);

        Bird.update();
        Bird.draw();
    }

    requestAnimationFrame(animate);
}

animate();
