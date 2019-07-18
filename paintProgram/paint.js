let canvas;
let ctx;
let savedImageData;
let dragging = false;
let strokeColor = 'black';
let fillColor = 'black';
let line_width = 2;
let polygonSides = 10;

let currentTool = 'brush';
let canvasWidth = 800;
let canvasHeight = 300;

// //SPRITE WIDTH AND HEIGHT
// let spriteWidth = 800;
// let spriteHeight = 280;
// let rows = 2;
// let cols = 8;

// let trackRight= 0;
// let trackLeft = 1;
// let width = spriteWidth/cols;
// let height = spriteHeight/rows;
// let curFrame=0;

// let frameCount = 8;

// let x =0;
// let y = 0;
// let srcX =0;
// let srcY = 0;

// let left = false;
// let right = true;

// let speed = 12;

// let canvas2 = document.getElementBy('new-canvas');

//  canvas2.width = canvasWidth;
//  canvas2.height = canvasHeight;

//  //var ctx = canvas.getContext("2d");



let usingBrush = false;
let brushXPoints = new Array();
let brushYPoints = new Array();
let brushDownPos = new Array();

class ShapeBoundingBox {
  constructor(left, top, width, height){
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;

  }
}


class MouseDownPos{
    constructor(x,y){
      this.x = x;
      this.y = y;
    }
}


class Location{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

class PolygonPoint{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

let shapeBoundingBox = new ShapeBoundingBox(0,0,0,0);
let mouseDown = new MouseDownPos(0,0);
let loc = new Location(0,0);

document.addEventListener('DOMContentLoaded', setupCanvas);

function setupCanvas(){
  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = line_width;
  canvas.addEventListener('mousedown', ReactToMouseDown);
  canvas.addEventListener('mousemove', ReactToMouseMove);
  canvas.addEventListener('mouseup', ReactToMouseUp);


  ////////////////////////////////////////////////////////
  // These event listeners are for touch controls when the 
  // user is using a mobile device
  //////////////

  
  canvas.addEventListener('touchstart', function(e) {
      mousePos = GetTouchPosition(canvas, e);
    let touch = e.touches[0];

    if (e.target == canvas) {
      e.preventDefault();
    }

    let mouseEvent =  new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);

    
  }, false);

  canvas.addEventListener('touchmove', function (e) {
    let touch = e.touches[0];

    if (e.target == canvas) {
      e.preventDefault();
    }

    let mouseEvent= new MouseEvent ("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  },false);


  canvas.addEventListener('touchend', function (e) {
    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);

    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);


  

  ////////////////////////////////////////////////////
}

function ChangeTool(toolClicked){
  document.getElementById('open').className = '';
  document.getElementById('save').className = '';
  document.getElementById('brush').className = '';
  document.getElementById('line').className = '';
  document.getElementById('rectangle').className = '';
  document.getElementById('circle').className = '';
  document.getElementById('ellipse').className = '';
  document.getElementById('polygon').className = '';
  document.getElementById(toolClicked).className = 'selected';
  currentTool = toolClicked;

}

function GetTouchPosition(){

}

// Get Mouse Position
function GetMousePosition(x,y){
  let canvasSizeData = canvas.getBoundingClientRect();
  return {x : (x - canvasSizeData.left) * (canvas.width / canvasSizeData.width),
    y : (y - canvasSizeData.top) * (canvas.height / canvasSizeData.height)};
}

// Save Canvas
function SaveCanvasImg(){
  savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
}

// REDRAW Canvas Image
function RedrawCanvasImage(){
  ctx.putImageData(savedImageData,0,0);
}

// Update Rubberband Size Data
function UpdateRubberbandSizeData(){
  shapeBoundingBox.width = (Math.abs(loc.x - mouseDown.x));
  shapeBoundingBox.height = (Math.abs(loc.y - mouseDown.y));

  if(loc.x > mouseDown){
    shapeBoundingBox.left=mouseDown.x;
  } else {
    shapeBoundingBox.left= loc.x;
  }
  if(loc.y > mouseDown.y){
    shapeBoundingBox.top=mouseDown.y;
  } else {
    shapeBoundingBox.top= loc.y;
  }

}
// Get Angle Using X and Y
function getAngleUsingXAndY(mouselocX,mouselocY){
  let adjacent = mouseDown.x - mouselocX;
  let opposite = mouseDown.y - mouselocY;

  return radiansToDegrees(Math.atan2(opposite, adjacent));
}
// Radians To Degrees
function radiansToDegrees(rad){
  return(rad * (180 / Math.PI)).toFixed(2);
}

// Degrees To Radians
function degreesToRadians(degrees){
  return(degrees * (Math.PI/180));
}

function getPolygonPoints(){
  // Get angle in radians based on x & y of mouse location
  let angle =  degreesToRadians(getAngleUsingXAndY(loc.x, loc.y));

  // X & Y for the X & Y point representing the radius is equal to
  // the X & Y of the bounding rubberband box
  let radiusX = shapeBoundingBox.width;
  let radiusY = shapeBoundingBox.height;
  // Stores all points in the polygon
  let polygonPoints = [];

  for(let i = 0; i < polygonSides; i++){
      polygonPoints.push(new PolygonPoint(loc.x + radiusX * Math.sin(angle),
      loc.y - radiusY * Math.cos(angle)));

      angle += 2 * Math.PI / polygonSides;
  }
  return polygonPoints;
}

function getPolygon(){
  let polygonPoints = getPolygonPoints();
  ctx.beginPath();
  ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
  for(let i = 1; i < polygonSides; i++){
      ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
  }
  ctx.closePath();
}

// Draw Rubberband Shape

function UpdateRubberbandOnMove(loc){
    UpdateRubberbandSizeData(loc);
    drawRubberbandShape(loc);
}

function drawRubberbandShape(loc){
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;

  if(currentTool === "brush"){
    // Create paint brush
    DrawBrush();
} else if(currentTool === "line"){
    // Draw Line
    ctx.beginPath();
    ctx.moveTo(mousedown.x, mousedown.y);
    ctx.lineTo(loc.x, loc.y);
    ctx.stroke();
} else if(currentTool === "rectangle"){
    // Creates rectangles
    ctx.strokeRect(shapeBoundingBox.left, shapeBoundingBox.top, shapeBoundingBox.width, shapeBoundingBox.height);
} else if(currentTool === "circle"){
    // Create circles
    let radius = shapeBoundingBox.width;
    ctx.beginPath();
    ctx.arc(mousedown.x, mousedown.y, radius, 0, Math.PI * 2);
    ctx.stroke();
} else if(currentTool === "ellipse"){
    // Create ellipses
    // ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
    let radiusX = shapeBoundingBox.width / 2;
    let radiusY = shapeBoundingBox.height / 2;
    ctx.beginPath();
    ctx.ellipse(mousedown.x, mousedown.y, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
} else if(currentTool === "polygon"){
    // Create polygons
    getPolygon();
    ctx.stroke();
}

}
// Update Rubberband On Move 
 


// React To Mouse Down
function ReactToMouseDown(e){
  canvas.style.cursor = "crosshair";
  loc = GetMousePosition(e.clientX, e.clientY);

  SaveCanvasImg();
  mouseDown.x = loc.x;
  mouseDown.y = loc.y;
  dragging = true;

  //TODO HANDLE BRUSH

  if(currentTool === 'brush'){
    usingBrush = true;
    AddBrushPoint(loc.x, loc.y);
}

}

// React To Mouse Up

function ReactToMouseMove(e){
  canvas.style.cursor = "crosshair";
  loc = GetMousePosition(e.clientX, e.clientY);

 

  if(currentTool === 'brush' && dragging && usingBrush){
    // Throw away brush drawings that occur outside of the canvas
    if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
        AddBrushPoint(loc.x, loc.y, true);
    }
    RedrawCanvasImage();
    DrawBrush();
} else {
    if(dragging){
        RedrawCanvasImage();
        UpdateRubberbandOnMove(loc);
    }
}

}

function ReactToMouseUp(e){
  canvas.style.cursor = "crosshair";
  loc = GetMousePosition(e.clientX, e.clientY);

    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);

    dragging = false;
  //TODO HANDLE BRUSH

}

function AddBrushPoint(x,y, mouseDown){
  brushXPoints.push(x);
  brushYPoints.push(y);
  brushDownPos.push(mouseDown);
}

function DrawBrush(){
  for(let i =1; i< brushXPoints.length; i++){
    ctx.beginPath();
    if(brushDownPos[i]){
      ctx.moveTo(brushXPoints[i-1], brushYPoints[i-1]);
    } else { 
      ctx.moveTo(brushXPoints[i]-1 , brushYPoints[i]);
    }
    ctx.lineTo(brushXPoints[i], brushYPoints[i]);
    ctx.closePath();
    ctx.stroke();
  }
}

//SaveImage
function SaveImage(){
  var imageFile = document.getElementById("img-file");
imageFile.setAttribute('download' , 'image.png');
imageFile.setAttribute('href' , canvas.toDataURL());

}


// OpenImage
function OpenImage(){
  let img = new Image();

  img.onload = function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
  }

  img.src = 'imgae.png';

}


function cloneCanvas(oldCanvas) {

  //create a new canvas
  var newCanvas = document.getElementById('new-canvas');
  ctx = newCanvas.getContext('2d');

  //set dimensions
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;

  //apply the old canvas to the new one
  ctx.drawImage(oldCanvas, 0, 0);

  ctx = oldCanvas.getContext('2d');

  //return the new canvas
  return newCanvas;
}

function setupAnimate(){


}

function animatedCanvas(){
  let newCanvas = document.getElementById('new-canvas');


}