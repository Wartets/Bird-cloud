# Simulation de Nuée d'Oiseaux

Une simulation interactive illustrant le comportement collectif des oiseaux en vol, basée sur le modèle des boids.

## 🛠 Fonctionnalités principales

1. **Simulation en Canvas HTML5** :
   - Les oiseaux sont représentés par des triangles animés.
   - Comportements basés sur 3 règles fondamentales :
     - **Cohésion** : Se rapprocher du centre de masse des voisins.
     - **Séparation** : Éviter les collisions avec les autres oiseaux.
     - **Alignement** : Suivre la direction moyenne des voisins.

2. **Facteur de fatigue** :
   - Les oiseaux ralentissent après un vol prolongé, simulant la fatigue, et reprennent progressivement leur vitesse.

3. **Comportement aléatoire** :
   - Certains oiseaux adoptent un comportement erratique temporaire.

4. **Panneau de contrôle interactif** :
   - Ajustez les paramètres de simulation en temps réel grâce à un panneau de configuration (accessible via un bouton ⚙️) :
     - Nombre d'oiseaux.
     - Vitesse maximale.
     - Force maximale.
     - Rayon de vision.
     - Rayon d'évitement.
     - Niveau de fatigue maximum.
     - Facteur d'imprévisibilité.

5. **Suivi des trajectoires** :
   - Cliquez sur un oiseau pour afficher/effacer sa trajectoire dans la simulation.

6. **Personnalisation des couleurs** :
   - Activez la différenciation par couleurs pour observer des groupes d’oiseaux similaires.

## 🚀 Instructions

1. Clonez ou téléchargez le projet et ouvrez `index.html` dans votre navigateur préféré. Ou sinon accèdez aux site [internet](https://wartets.github.io/Bird-cloud/).
2. Cliquez sur l'icône ⚙️ pour ouvrir le panneau de configuration.
3. Ajustez les paramètres pour découvrir les différents comportements de la nuée.

## 🛠 Technologies utilisées

- **HTML5** : Pour le canvas et la structure générale.
- **CSS3** : Pour le style de l'interface utilisateur.
- **JavaScript (ES6)** : Pour la simulation et les interactions utilisateur.

## 📖 Explication des paramètres

- **Nombre d'oiseaux** : Contrôle le nombre total d'oiseaux dans la simulation.
- **Vitesse maximale** : Limite la vitesse de déplacement des oiseaux.
- **Force maximale** : Détermine l’intensité des ajustements de direction.
- **Rayon de vision** : Portée dans laquelle un oiseau détecte ses voisins.
- **Rayon d'évitement** : Distance minimale pour éviter les collisions.
- **Fatigue maximale** : Influence la capacité des oiseaux à maintenir leur vitesse.
- **Imprévisibilité** : Ajoute un comportement aléatoire à certains oiseaux.

---