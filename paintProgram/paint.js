let canvas;
let ctx
let savedImageData;
let dragging = false;
let strokeColor = 'black';
let fillColor = 'black';
let line_width = 2;
let currentTool = 'brush'
let canvasWidth = 600;
let canvasHeight = 600;


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
}

function ChangeTool(toolClicked){
  document.getElementById('open').className = '';
  document.getElementById('save').className = '';
  document.getElementById('brush').className = '';
  document.getElementById('line').className = '';
  document.getElementById('rectangle').className = '';
  //document.getElementById('circle').className = '';
  //document.getElementById('ellipse').className = '';
  //document.getElementById('polygon').className = '';
  document.getElementById(toolClicked).className = 'selected';
  currentTool = toolClicked;

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
  let angle = degreesToRadians(); 
}

// Draw Rubberband Shape

function UpdateRubberbandOnMove(loc){
    UpdateRubberbandSizeData(loc);
    drawRubberbandShape(loc);
}

function drawRubberbandShape(loc){
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.strokeRect(shapeBoundingBox.left, shapeBoundingBox.top,
  shapeBoundingBox.width,shapeBoundingBox.height);
}
// Update Rubberband On Move 
 


// React To Mouse Down
function ReactToMouseDown(e){
  canvas.style.cursor = "crosshair"
  loc = GetMousePosition(e.clientX, e.clientY);

  SaveCanvasImg();
  mouseDown.x = loc.x;
  mouseDown.y = loc.y;
  dragging = true;

  //TODO HANDLE BRUSH

}

// React To Mouse Up

function ReactToMouseMove(e){
  canvas.style.cursor = "crosshair";
  loc = GetMousePosition(e.clientX, e.clientY);

 if(dragging){
   RedrawCanvasImage();
   UpdateRubberbandOnMove();
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

//SaveImage
function SaveImage(){
  var imageFile = document.getElementById();
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

