let canvas;
let cinter; // Canvas Interface

function init_canvas(parent) {
    canvas = document.createElement("canvas")
    cinter = canvas.getContext("2d")
    parent.appendChild(canvas)
}