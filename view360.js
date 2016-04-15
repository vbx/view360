/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 vbx  (https://github.com/vbx/view360)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.prototype 
 *
 */
var View360 = function (options) {

    var plugin = this; //alias
    var elm = options.element;
    var type = elm.tagName;
    var container = elm.parentNode;
    var canvas = undefined;

    var camera, scene, renderer;
    var isUserInteracting = false,
            lon = 0,
            lat = 0,
            phi = 0,
            theta = 0;

    var onDocumentMouseDown = function (event) {
        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;

        onPointerDownLon = lon;
        onPointerDownLat = lat;
    };

    var onDocumentMouseMove = function (event) {
        if (isUserInteracting === true) {
            lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
            lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        }
    };

    var onDocumentMouseUp = function (event) {
        isUserInteracting = false;
    };

    var onDocumentMouseWheel = function (event) {
        event.preventDefault();
        var allow = function (v) {
            return (Math.abs(v) != v && camera.fov < 100 || //-
                    Math.abs(v) == v && camera.fov > 30 //+
                    );
        };
        // WebKit
        if (event.originalEvent && event.originalEvent.wheelDeltaY) {
            if (allow(event.originalEvent.wheelDeltaY))
                camera.fov -= event.originalEvent.wheelDeltaY * 0.05;
            // Opera / Explorer 9
        } else if (event.wheelDelta) {
            if (allow(event.wheelDelta))
                camera.fov -= event.wheelDelta * 0.05;
            // Firefox
        } else if (event.detail) {
            if (allow(-1 * event.detail))
                camera.fov -= -1 * event.detail * 0.05;
        }
        camera.updateProjectionMatrix();
    };

    var update = function () {
        if (isUserInteracting === false) {
            lon += 0.1;
        }

        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(lon);

        camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
        camera.target.y = 500 * Math.cos(phi);
        camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(camera.target);

        // distortion
        //camera.position.copy( camera.target ).negate();

        renderer.render(scene, camera);
    };
    var getTexture = function () {
        if (type == 'IMG') {
            var t = new THREE.TextureLoader();
            t.crossOrigin = 'anonymous';
            return t.load(elm.src);
        }

        if (type == 'VIDEO') {
            var texture = new THREE.VideoTexture(elm);
            texture.minFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            return texture;
        }
        return undefined;
    };
    //public
    plugin.init = function () {
        var mesh;
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        camera.target = new THREE.Vector3(0, 0, 0);

        scene = new THREE.Scene();

        var geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        var material = new THREE.MeshBasicMaterial({
            map: getTexture()
        });
        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        renderer = new THREE.WebGLRenderer();
        canvas = renderer.domElement
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(elm.clientWidth, elm.clientHeight);
        container.appendChild(renderer.domElement);

        canvas.addEventListener('mousedown', onDocumentMouseDown);
        canvas.addEventListener('mousemove', onDocumentMouseMove);
        canvas.addEventListener('mouseup', onDocumentMouseUp);
        canvas.addEventListener('mousewheel', onDocumentMouseWheel);
        canvas.addEventListener('MozMousePixelScroll', onDocumentMouseWheel);
        elm.style.display = "none";
    };

    plugin.animate = function () {
        requestAnimationFrame(plugin.animate);
        update();
    };
    plugin.resize = function (w, h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    plugin.registerReady = function () {
        var start = function () {
            plugin.init();
            plugin.animate();
        };
        if (type == 'IMG') {
            elm.addEventListener('load', start);
        }
        if (type == 'VIDEO') {
            elm.addEventListener('loadeddata', start);
        }
    };
};
View360.instances = [];
View360.initialise = function (arg) {
    var elements = [];
    if (typeof (arg) === 'undefined') {
        if (View360.autoDiscover !== false) {
            elements = document.getElementsByClassName('view360');
        }
    } else if (typeof (arg) === 'string') {
        if (arg[0] == '.') {
            elements = document.getElementsByClassName(arg.substr(1));
        }
        if (arg[0] == '#') {
            elements = [document.getElementById(arg.substr(1))];
        }
    } else if (typeof (arg) === 'object') {
        elements = [arg[0]];
    }

    for (var i = 0; i < elements.length; i++) {
        View360.instances[i] = new View360({element: elements[i]})
        View360.instances[i].registerReady();
    }
};
(function (View360) {
    document.addEventListener('DOMContentLoaded', function () {
        View360.initialise();
    });
})(View360);