# Bird Flock Simulation

An interactive simulation illustrating the collective flight behavior of birds, based on the boids model.

## Main Features

1. **HTML5 Canvas Simulation**:
   - Birds are represented by animated triangles.
   - Behaviors are based on 3 fundamental rules:
     - **Cohesion**: Moving toward the center of mass of neighbors.
     - **Separation**: Avoiding collisions with other birds.
     - **Alignment**: Matching the average direction of neighbors.

2. **Fatigue Factor**:
   - Birds slow down after prolonged flight, simulating fatigue, and gradually regain speed.

3. **Random Behavior**:
   - Some birds adopt temporary erratic behavior.

4. **Interactive Control Panel**:
   - Adjust simulation parameters in real-time via a configuration panel (accessible via a gear button):
     - Number of birds.
     - Maximum speed.
     - Maximum force.
     - Vision radius.
     - Avoidance radius.
     - Maximum fatigue level.
     - Unpredictability factor.

5. **Trajectory Tracking**:
   - Click on a bird to toggle its flight path display within the simulation.

6. **Color Customization**:
   - Enable color differentiation to observe groups of similar birds.

## Instructions

1. Clone or download the project and open `index.html` in your preferred browser. Alternatively, access the [website](https://wartets.github.io/Bird-cloud/).
2. Click on the gear icon to open the configuration panel.
3. Adjust the parameters to discover different flock behaviors.

## Technologies Used

- **HTML5**: For the canvas and general structure.
- **CSS3**: For the user interface styling.
- **JavaScript (ES6)**: For the simulation and user interactions.

## Parameter Explanation

- **Number of birds**: Controls the total number of birds in the simulation.
- **Maximum speed**: Limits the flight speed of the birds.
- **Maximum force**: Determines the intensity of direction adjustments.
- **Vision radius**: Range within which a bird detects its neighbors.
- **Avoidance radius**: Minimum distance to avoid collisions.
- **Maximum fatigue**: Influences the birds' ability to maintain speed.
- **Unpredictability**: Adds random behavior to certain birds.
