# view360
View360 is an easy to use threejs library for convert equirectangular image or video to a 360° panorama.

### Usage ###

Download [threejs](http://threejs.org/build/three.min.js) and include it in your html.
Add view360.js.

```html
<script src="js/three.min.js"></script>
<script src="js/view360.js"></script>
```

add your equirectangular media image or video in html body with default class "view360"

```html
<img class="view360" src="http://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg" crossorigin />
<video class="view360" src="http://threejs.org/examples/textures/pano.webm" crossorigin loop autoplay></video>
```

That's all !

### Other usage ###
```javascript
//Disable auto discover for all elements
View360.autoDiscover=false;

//initialise via javascript
//class 
View360.initialise('.mycustomclass');
//id
View360.initialise('#mycustomid');
//object
View360.initialise(document.getElementById('mycustomid'));
```
