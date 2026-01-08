# Bird-cloud: High-Performance Flocking Simulation

An interactive, high-performance simulation of nature's flocking behavior, built using the Boids algorithm and HTML5 Canvas. This project demonstrates complex emergent behavior from simple rules, optimized to handle thousands of entities simultaneously.

## Key Features

### Core Behaviors
- **The Boids Algorithm**: Implements the three fundamental rules of flocking:
  - **Separation**: Steer to avoid crowding local flockmates.
  - **Alignment**: Steer towards the average heading of local flockmates.
  - **Cohesion**: Steer to move towards the average position of local flockmates.
- **Predator Avoidance**: The mouse cursor acts as a predator; birds actively flee from it based on the "Predator Force" setting.
- **Fatigue System**: Birds accumulate fatigue based on speed, forcing them to slow down and glide periodically.
- **Chaos/Misconduct**: A probabilistic factor where random birds momentarily ignore rules, adding natural unpredictability to the flock.

### Interactive Controls
- **Real-time Parameter Tuning**: Adjust flock dynamics instantly via the settings gear:
  - **Bird Count**: Scale from a few to thousands.
  - **Physics**: Max Speed, Max Force, Vision Radius, Avoidance Radius.
  - **Behaviors**: Fatigue threshold, Chaos factor, Predator repulsion force.
- **Color Cohesion**: A toggleable mode where birds preferentially flock only with others of a similar color.
- **Path Tracking**: Click on any bird to visualize its flight path history.

## Technical Optimizations

To achieve high frame rates with thousands of agents ($O(N^2)$ complexity naive approach), this project utilizes several advanced optimization techniques:

1.  **Spatial Partitioning (Spatial Grid)**:
    - Instead of every bird checking every other bird (which becomes exponentially slow), the canvas is divided into a grid based on the vision radius.
    - Birds are linked into these grid cells using a linked-list approach (`heads` and `next` arrays).
    - Checks are limited to the current cell and immediately adjacent cells, reducing complexity to roughly $O(N \times k)$ (where $k$ is local density).

2.  **Structure of Arrays (SoA) & Typed Arrays**:
    - Rather than using an array of Objects (e.g., `[{x, y, vx}, {x, y, vx}]`), the simulation uses parallel Typed Arrays (`Float32Array` for physics, `Uint8Array` for colors).
    - **Benefits**:
        - Significant reduction in memory overhead.
        - Improved CPU cache locality (sequential memory access).
        - Elimination of Garbage Collection pauses (arrays are pre-allocated).

3.  **Memory Management**:
    - A static capacity (60,000) is pre-allocated.
    - No objects are created or destroyed during the animation loop.
    - Pointers and indices are used instead of `push`/`pop` operations.

4.  **Math & Rendering Optimizations**:
    - **Squared Distance Checks**: Comparisons are done using $distance^2$ to avoid costly `Math.sqrt()` calls in the inner loops.
    - **Level of Detail**: When the bird count exceeds 3,000, the renderer switches from drawing calculated vector triangles to simple rectangles to maintain GPU performance.
    - **Bitwise Operations**: Used for fast floor calculations (`| 0`) and color integer manipulation.

## How to Use

1.  **Installation**:
    Clone the repository and open `index.html` in any modern web browser.
    ```bash
    git clone https://github.com/wartets/Bird-cloud.git
    ```
2.  **Simulation**:
    - **Move Mouse**: Repel birds (if Predator Force > 0).
    - **Left Click**: Select a bird to trace its path. Click empty space to deselect.
    - **Gear Icon**: Open settings to tweak simulation variables.
    - **Question Mark**: View basic information.

## Parameters Explained

- **Bird Count**: Total agents in the scene.
- **Max Speed**: The top speed a bird can fly.
- **Max Force**: How sharply a bird can turn/accelerate.
- **Vision Radius**: How far a bird can "see" neighbors to align/cohere.
- **Avoidance Radius**: The personal space bubble; birds inside this radius trigger separation.
- **Fatigue Threshold**: How quickly birds get tired and slow down.
- **Chaos Factor**: The likelihood and intensity of random movement.
- **Predator Force**: The strength of repulsion from the mouse cursor.

## Technologies

- **HTML5 Canvas**: For high-speed 2D rendering.
- **JavaScript (ES6+)**: Simulation logic.
- **CSS3**: UI overlay and glass-morphism effects.
