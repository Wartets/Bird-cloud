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
	if (!canClick) return;  // Empêche de cliquer trop rapidement

	canClick = false;
	setTimeout(() => canClick = true, 500);
    const x = event.clientX;
    const y = event.clientY;

    // Vérifier quel oiseau est cliqué
    let birdClicked = null;
    for (let bird of birds) {
        if (dist({x, y}, bird.position) < bird.size * 2) {  // Vérifier si on clique dans la zone de l'oiseau
            birdClicked = bird;
            break;
        }
    }

    if (birdClicked) {
        // Si un oiseau est sélectionné
        if (currentBird === birdClicked) {
            // Si on clique à nouveau sur le même oiseau, effacer le tracé
            birdPaths[birdClicked.color] = [];
            currentBird = null;
        } else {
            // Si un autre oiseau est sélectionné, effacer l'ancien tracé et démarrer un nouveau tracé
            if (currentBird) {
                birdPaths[currentBird.color] = [];
            }
            currentBird = birdClicked;
            birdPaths[currentBird.color] = [{ x: currentBird.position.x, y: currentBird.position.y }];
        }
    } else {
        // Si aucun oiseau n'est cliqué, effacer l'ancien tracé
        if (currentBird) {
            birdPaths[currentBird.color] = [];
            currentBird = null;
        }
    }
});

controlsToggle.addEventListener('click', () => {
    controlsWindow.classList.toggle('show');
});

let cursorHidden = false;
let inactivityTimeout;  // Référence pour le timer d'inactivité

// Fonction pour cacher le curseur
function hideCursor() {
    document.body.style.cursor = 'none';  // Cacher le curseur
    cursorHidden = true;
}

// Fonction pour afficher le curseur
function showCursor() {
    document.body.style.cursor = 'auto';  // Afficher le curseur
    cursorHidden = false;
}

canvas.addEventListener('mousemove', () => {
    if (cursorHidden) {
        showCursor();  // Réafficher le curseur si il était caché
    }
    clearTimeout(inactivityTimeout);  // Réinitialiser le timer d'inactivité
    inactivityTimeout = setTimeout(hideCursor, 3900);  // Redémarrer le compte à rebours de 5 secondes
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

// Classe Bird
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
		this.size = 4.5 - 0.8 * Math.random()
		this.strayChance = Math.random() * 0.01 * (this.size / 4.5)
    }
	
    sameColorBirds(birds) {
		const threshold = 50;  // Seuil de distance pour considérer les couleurs comme similaires
		return birds.filter(bird => colorDistance(this.color, bird.color) < threshold);
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
		if (bird_color) {
			this.velocity = limit(this.velocity, MAX_SPEED * 2);
		}
		else {
			this.velocity = limit(this.velocity, MAX_SPEED);
		}

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
		if (this.fatigue > MAX_FATIGUE) {
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

		if (bird_color) {
			const sameColorBirds = this.sameColorBirds(birds);  // Filtrer par couleur

			for (let Bird of sameColorBirds) {
				const distance = dist(this.position, Bird.position);
				if (Bird !== this && distance < VISION_RADIUS) {
					center.x += Bird.position.x;
					center.y += Bird.position.y;
					total++;
				}
			}
		}
		else {
			for (let Bird of birds) {
				const distance = dist(this.position, Bird.position);
				if (Bird !== this && distance < VISION_RADIUS) {
					center.x += Bird.position.x;
					center.y += Bird.position.y;
					total++;
				}
			}
		}

		// Interaction avec les oiseaux proches des bords (à l'autre côté)
		if (this.position.x < VISION_RADIUS) {
			for (let Bird of birds) {
				if (Bird !== this && Bird.position.x > canvas.width - VISION_RADIUS) {
					const distance = dist(this.position, Bird.position);
					if (distance < VISION_RADIUS) {
						center.x += Bird.position.x;
						center.y += Bird.position.y;
						total++;
					}
				}
			}
		}

		if (this.position.y < VISION_RADIUS) {
			for (let Bird of birds) {
				if (Bird !== this && Bird.position.y > canvas.height - VISION_RADIUS) {
					const distance = dist(this.position, Bird.position);
					if (distance < VISION_RADIUS) {
						center.x += Bird.position.x;
						center.y += Bird.position.y;
						total++;
					}
				}
			}
		}

		if (Math.random() < this.strayChance) {
			return {
				x: (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1), // Mouvement aléatoire
				y: (Math.random() < 0.5 ? 1 : -1) * MISCONDUCT * (Math.random() * 4 - 1),
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
        
		if (bird_color) {		
			const sameColorBirds = this.sameColorBirds(birds);  // Filtrer par couleur

			for (let Bird of sameColorBirds) {
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
		}
		else {
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

		if (bird_color) {	
			const sameColorBirds = this.sameColorBirds(birds);  // Filtrer par couleur

			for (let Bird of sameColorBirds) {
				const distance = dist(this.position, Bird.position);
				if (Bird !== this && distance < VISION_RADIUS) {
					avgVelocity.x += Bird.velocity.x;
					avgVelocity.y += Bird.velocity.y;
					total++;
				}
			}
		}
		else {
			for (let Bird of birds) {
				const distance = dist(this.position, Bird.position);
				if (Bird !== this && distance < VISION_RADIUS) {
					avgVelocity.x += Bird.velocity.x;
					avgVelocity.y += Bird.velocity.y;
					total++;
				}
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

// Mettre à jour les tracés des oiseaux
function updateBirdPaths() {
	if (currentBird) {
		birdPaths[currentBird.color].push({ x: currentBird.position.x, y: currentBird.position.y });
	}
}

// Dessiner les tracés
function drawPaths() {
    for (let color in birdPaths) {
        const path = birdPaths[color];
        if (path.length > 1) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                const prevPoint = path[i - 1];
                const currentPoint = path[i];

                // Détecter une téléportation
                const dx = Math.abs(currentPoint.x - prevPoint.x);
                const dy = Math.abs(currentPoint.y - prevPoint.y);
                const teleported = dx > canvas.width / 2 || dy > canvas.height / 2;

                if (teleported) {
                    // Si téléportation, ne pas dessiner ce segment
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


// Utilitaires
function colorDistance(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Fonction pour convertir un hex en RGB
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

// Initialisation
for (let i = 0; i < NUM_BIRDS; i++) {
    birds.push(new Bird(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Boucle d'animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	updateBirdPaths();
	drawPaths();

    // Mettre à jour les oiseaux
    for (let bird of birds) {
        const cohesionForce = bird.cohesion(birds);
        const separationForce = bird.separation(birds);
        const alignmentForce = bird.alignment(birds);

        bird.applyForce(cohesionForce);
        bird.applyForce(separationForce);
        bird.applyForce(alignmentForce);
		

        bird.update();
        bird.draw();
    }

    requestAnimationFrame(animate);
}

animate();

