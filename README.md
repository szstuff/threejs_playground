
**ThreeJS Playground**    
ThreeJS Playground is a first-person experience developed using Three.js over a weekend. The goal of the project was to explore the capabilities of Three.js.  
The user can explore an apartment using standard FPS controls (WASD + mouse) and watch puppies roaming around.   

**Bugs and issues**   
- Puppies tend to approach walls and windows, sometimes jumping out and disappearing from the scene.  
- Puppies tend to levitate when climbing up curtains or other objects in the map.   
- Puppies are created as Capsule objects, which helps with collision (with the map) but makes their behaviour more difficult to manipulate  
- Lack of collision detection between puppies and the player.  

**To experience Puppy Playground:**  
Clone this repository to your local machine.  
Run this in the terminal to install dependencies and run the project locally:  
```
"npm install && npx vite"
```
Click the localhost link provided by vite to open the preview in browser.  
Explore the apartment and enjoy the experience.

**Assets and frameworks used**  
Three.js 3D library:  
https://threejs.org/docs/index.html#manual/en/introduction

Project used as reference when creating FPS controls, collision detection, etc:  
https://threejs.org/examples/?q=fps#games_fps

World model:  
"Mirror's Edge Apartment - Interior Scene" (https://skfb.ly/YZoC) by Aurélien Martel is licensed under Creative Commons Attribution-NonCommercial (http://creativecommons.org/licenses/by-nc/4.0/).

Puppy model:  
"Dog Puppy" (https://skfb.ly/oRKH6) by kenchoo is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

Misc. icons from Google  
https://fonts.google.com/icons


