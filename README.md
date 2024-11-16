# Simulation de Nuée d'Oiseaux

Ce projet est une simulation interactive basée sur le modèle des boids, illustrant le comportement collectif des oiseaux en vol. 

## Fonctionnalités principales

1. **Simulation en Canvas HTML5** :
   - Les oiseaux sont représentés par des triangles.
   - Comportements basés sur 3 règles :
     - **Cohésion** : Se rapprocher du centre de masse des voisins.
     - **Séparation** : Éviter les collisions avec les autres oiseaux.
     - **Alignement** : Suivre la direction moyenne des voisins.

2. **Facteur de fatigue** :
   - Les oiseaux ralentissent après un vol prolongé et reprennent progressivement leur vitesse.

3. **Comportement aléatoire** :
   - Certains oiseaux s'écartent temporairement du groupe de manière aléatoire.

4. **Panneau de contrôle interactif** :
   - Ouvrez/fermez un panneau de configuration à l'aide d'un bouton dans le coin supérieur droit.
   - Ajustez dynamiquement les paramètres via des curseurs :
     - Nombre d'oiseaux.
     - Vitesse maximale.
     - Force maximale.
     - Rayon de vision.
     - Rayon d'évitement.

## Instructions

1. Ouvrez `index.html` dans un navigateur.
2. Cliquez sur l'icône ⚙️ pour ouvrir le panneau de contrôle.
3. Ajustez les paramètres pour observer l'impact sur la simulation en temps réel.

## Technologies utilisées

- **HTML5** : Structure et Canvas pour le rendu graphique.
- **CSS3** : Styles pour l'interface utilisateur.
- **JavaScript (ES6)** : Gestion de la simulation et des interactions utilisateur.
