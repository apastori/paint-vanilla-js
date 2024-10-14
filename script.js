const Modes = {
    DRAW: "draw",
    ERASE: "erase",
    RECTANGLE: "rectangle",
    ELLIPSE:"ellipse",
    PICKER: 'picker',
    SAVE: 'save'
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
let mode;
let imageData;
let isShiftPressed = false;

(() => { 
    if (typeof window.EyeDropper !== 'undefined') {
        pickerButton.removeAttribute('disabled');
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

drawButton.addEventListener("click", async () => {
    await setMode(Modes.DRAW);
});

rectangleButton.addEventListener("click", async () => {
    await setMode(Modes.RECTANGLE);
});

eraseButton.addEventListener("click", async () => {
    await setMode(Modes.ERASE);
});

pickerButton.addEventListener("click", async () => {
    await setMode(Modes.PICKER);
});

saveButton.addEventListener("click", async () => {
    await setMode(Modes.SAVE);
});

function startDrawing(event) {
    isDrawing = true;
    const { offsetX, offsetY } = event;
    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function stopDrawing() {
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
        let width = offsetX - startX;
        let height = offsetY - startY;
        if (isShiftPressed) {
            const sideSquare = Math.min(Math.abs(width), Math.abs(height));
            width = width > 0 ? sideSquare : sideSquare * -1;
            height = height > 0 ? sideSquare : sideSquare * -1;
        }
        context.beginPath();
        context.rect(startX, startY, width, height);
        context.stroke();
        return;
    }
}

function handleChangeColor() {
    const { value } = colorPicker;
    context.strokeStyle = value;
}

function handleClear() {
    //Clear Canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
}

const modeActions = {
    "draw": drawModeAction,
    "erase": eraseModeAction,
    "rectangle": rectangleModeAction,
    "ellipse": ellipseModeAction,
    "picker": pickerModeAction,
    "save": saveModeAction
}

function drawModeAction() {
    drawButton.classList.add('active');
    //canvas.style.cursor = 'crosshair';
    canvas.style.cursor = "url(./cursors/pincel.png) 0 24, auto";
    //Place new Drawing over existing content
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = 2;
    return;
}

function rectangleModeAction() {
    rectangleButton.classList.add('active');
    canvas.style.cursor = 'nw-resize';
    //Place new Drawing over existing content
    context.globalCompositeOperation = 'source-over';
    context.lineWidth = 2;
    return;
}

function eraseModeAction() {
    eraseButton.classList.add('active');
    canvas.style.cursor = "url(./cursors/erase.png) 0 24, auto";
    //Eliminate existing content
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = 20;
    return; 
}

async function pickerModeAction(previousMode) {
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

function saveModeAction(previousMode) {
    context.globalCompositeOperation="destination-over";
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.href = canvas.toDataURL()
    link.download = 'my-paint.png';
    link.click()
    setMode(previousMode)
    return;
}

function ellipseModeAction() {

}

async function setMode(newMode) {
    const previousMode = mode;
    mode = newMode;
    const activeButton = selector("nav > button.active");
    if (activeButton) activeButton.classList.remove("active");
    if (mode === Modes.PICKER || mode === Modes.SAVE) {
        modeActions[mode](previousMode);
        return;
    }
    modeActions[mode]();
}

function handleKeyDown({ key }) {
    isShiftPressed = key === 'Shift';
}

function handleKeyUp({ key }) {
    if (key === 'Shift') isShiftPressed = false;
}

//Inital Mode DRAW
setMode(Modes.DRAW);

(() => {
    context.lineJoin = 'round';
    context.lineCap = 'round';
})();