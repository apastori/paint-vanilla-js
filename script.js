const Modes = {
    DRAW: "draw",
    ERASE: "erase",
    RECTANGLE: "rectangle",
    ELLIPSE:"ellipse",

}

const selector = (selector) => {
    return document.querySelector(selector);
}

const selectorList = (selector) => {
    return document.querySelectorAll(selector);
}

const canvas = selector("#canvas-paint");
const colorPicker = selector("#color-picker");

const context = canvas.getContext("2d");

let startX, startY;
let lastX, lastY;
let isDrawing = false;

canvas.addEventListener("mousedown", (event) => {
    startDrawing(event);
});

canvas.addEventListener("mousemove", (event) => {
    draw(event)
});

canvas.addEventListener("mouseup", (event) => {
    stopDrawing(event);
});

canvas.addEventListener("mouseleave", (event) => {
    stopDrawing(event);
});

colorPicker.addEventListener("change", () => {
    handleChangeColor();
})

function startDrawing(event) {
    isDrawing = true;
    const { offsetX, offsetY } = event;
    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];
}

function stopDrawing(event) {
    isDrawing = false;
}

function draw(event) {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event;
    //start drawing
    context.beginPath();
    //move to current coordinates
    context.moveTo(lastX, lastY);
    context.lineTo(offsetX, offsetY);
    context.stroke();
    [lastX, lastY] = [offsetX, offsetY];
}

function handleChangeColor() {
    const { value } = colorPicker;
    context.strokeStyle = value;
}
