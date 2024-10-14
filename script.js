const Modes = {
    DRAW: "draw",
    ERASE: "erase",
    RECTANGLE: "rectangle",
    ELLIPSE:"ellipse",
    PICKER: 'picker',
    SAVE: 'save'
};

const modesDrawFunction = {

};

const modesSetFunctions = {

};

const selector = (selector) => {
    return document.querySelector(selector);
}

const selectorList = (selector) => {
    return document.querySelectorAll(selector);
}

const canvas = selector("#canvas-paint");
const colorPicker = selector("#color-picker");
const clearButton = selector("#clear-button");
const drawButton = selector("#draw-button");
const eraseButton = selector("#erase-button");
const rectangleButton = selector("#rectangle-button");
const pickerButton = selector("#picker-button");
const saveButton = selector("#save-button");


const context = canvas.getContext("2d");

let startX, startY;
let lastX, lastY;
let isDrawing = false;
let mode = Modes.DRAW;
let imageData;
let isShiftPressed = false;

(() => { 
    if (typeof window.EyeDropper !== 'undefined') {
        pickerButton.style.display = "block";
    }
})();

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
});

clearButton.addEventListener("click", () => {
    handleClear();
});

document.addEventListener("keydown", (event) => {
    handleKeyDown(event);
});

document.addEventListener("keyup", (event) => {
    handleKeyUp(event);
});

drawButton.addEventListener("click", () => {
    setMode(Modes.DRAW);
});

rectangleButton.addEventListener("click", () => {
    setMode(Modes.RECTANGLE);
});

eraseButton.addEventListener("click", () => {
    setMode(Modes.ERASE);
});

pickerButton.addEventListener("click", () => {
    setMode(Modes.PICKER);
});

function startDrawing(event) {
    isDrawing = true;
    const { offsetX, offsetY } = event;
    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function stopDrawing(event) {
    isDrawing = false;
}

function draw(event) {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event;
    if (mode === Modes.DRAW || mode === Modes.ERASE) {
        //start drawing
        context.beginPath();
        //move to current coordinates
        context.moveTo(lastX, lastY);
        context.lineTo(offsetX, offsetY);
        context.stroke();
        [lastX, lastY] = [offsetX, offsetY];
        return;
    }
    if (mode === Modes.RECTANGLE) {
        context.putImageData(imageData, 0, 0);
        // startX initial coordinate click
        const width = offsetX - startX;
        const height = offsetY - startY;
        context.beginPath();
        context.rect(startX, startY, width, height);
        context.stroke();
        return;
    }
    if (mode === Modes.ERASE) {

    }
}

function handleChangeColor() {
    const { value } = colorPicker;
    context.strokeStyle = value;
}

function handleClear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

const modeElements = {
    DRAW: "draw",
    ERASE: "erase",
    RECTANGLE: "rectangle",
    ELLIPSE:"ellipse",
    PICKER: 'picker',
    SAVE: 'save'
}

async function setMode(newMode) {
    const previousMode = mode;
    mode = newMode;
    const activeButton = selector("nav > button.active");
    if (activeButton) activeButton.classList.remove("active");
    if (mode === Modes.DRAW) {
        drawButton.classList.add('active');
        canvas.style.cursor = 'crosshair';
        //Place new Drawing over existing content
        context.globalCompositeOperation = 'source-over';
        context.lineWidth = 2;
        return;
    }
    if (mode === Modes.RECTANGLE) {
        rectangleButton.classList.add('active');
        canvas.style.cursor = 'nw-resize';
        //Place new Drawing over existing content
        context.globalCompositeOperation = 'source-over';
        context.lineWidth = 2;
        return;
    }
    if (mode === Modes.ERASE) {
        eraseButton.classList.add('active');
        canvas.style.cursor = "url(./cursors/erase.png) 0 24, auto";
        //Eliminate existing content
        context.globalCompositeOperation = 'destination-out';
        context.lineWidth = 20;
        return; 
    }
    if (mode === Modes.PICKER) {
        pickerButton.classList.add("active");
        const EyeDropper = new window.EyeDropper();
        try {
            const colorHexValue = await EyeDropper.open();
            const { sRGBHex } = colorHexValue;
            context.strokeStyle = sRGBHex;
            colorPicker.value = sRGBHex;
            setMode(previousMode);
        } catch(error) {
            console.log(error);
            throw new Error("Error using Eye Dropper API");
        }
        return;
    }
}

function handleKeyDown({ key }) {
    isShiftPressed = key === 'Shift';
}

function handleKeyUp({ key }) {
    if (key === 'Shift') isShiftPressed = false;
}