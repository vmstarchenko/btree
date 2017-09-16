var cnv=document.getElementById("cnv"),
    ctx=cnv.getContext("2d");

var startBtn = document.getElementById("start-btn"),
    stopBtn = document.getElementById("stop-btn");

startBtn.onclick = start;
stopBtn.onclick = stop;


var leftStickAngleField = document.getElementById("left-stick-angle");
var rightStickAngleField = document.getElementById("right-stick-angle");
var treeDepthField = document.getElementById("tree-depth");
var noiseField = document.getElementById("noise");
var maxStickPointsField = document.getElementById("max-stick-points");
var drawIntervalField = document.getElementById("draw-interval");
// var drawStyleField = document.getElementById("draw-style");

document.getElementById('draw-lines').onchange = function() {
  maxStickPointsField.parentElement.classList.add('hidden')
};
document.getElementById('draw-circles').onchange = function() {
  maxStickPointsField.parentElement.classList.remove('hidden')
};

var timer = undefined;

function start() {
  stop()

  var sticks=[new Stick(cnv.width/2,cnv.height*3/4,cnv.width/6,0)];
  var iterationsNumber = parseInt(treeDepthField.value);
  var angleLeft= parseInt(leftStickAngleField.value);
  var angleRight= parseInt(rightStickAngleField.value);
  var noise = parseInt(noiseField.value);
  var maxStickPointsNumber = parseInt(maxStickPointsField.value);
  var drawInterval = parseInt(drawIntervalField.value);
  var drawStyle = {
    'circles': 0,
    'lines': 1,
  }[document.querySelector('input[name="draw-style"]:checked').value];

  var sticksNumber = 2 ** iterationsNumber - 1;

  timer = setInterval(function(){
    var sticks_length = sticks.length

    if (!sticks[sticks.length-1].finished) {
      stop(timer);
    }

    drawBackground(ctx);

    var finished = true;

    for(var i=0;i<sticks_length;i++){
      var stick=sticks[i];
      if(stick.stage<stick.size){
        stick.stage+=Math.max(stick.size/20, 0.5);
      }

      DrawStick(stick, drawStyle, maxStickPointsNumber);

      var angleRad=stick.angle*Math.PI/180;
      var ofsX=Math.sin(angleRad)* stick.stage;
      var ofsY=Math.cos(angleRad)* stick.stage;

      // add new sticks
      if(stick.finished && stick.stage >= stick.size) {
        stick.finished = false;
        if (sticks_length < sticksNumber){
          stick.is_leaf = false;
          sticks.push(new Stick(
            stick.X+ofsX,
            stick.Y-ofsY,
            stick.size,
            stick.angle-angleLeft+(Math.random()-0.5) * 2 * noise));
          sticks.push(new Stick(
            stick.X+ofsX,
            stick.Y-ofsY,
            stick.size,
            stick.angle+angleRight+(Math.random()-0.5) * 2 * noise));
        }
      }
    }

  }, drawInterval);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}


start();


function Stick(x,y,size,angle){
  this.X=x;
  this.Y=y;
  this.size=size/100*80;
  this.stage=0;
  this.angle=angle;
  this.finished=true;
  this.is_leaf=true;
}

function DrawStick(stick, drawStyle, maxStickPointsNumber) {
  var angleRad=stick.angle*Math.PI/180;

  // drdaw stick
  var ofsX=Math.sin(angleRad)* stick.stage;
  var ofsY=Math.cos(angleRad)* stick.stage;

  // console.log(stick.stage);

  var x1 = stick.X,
      y1 = stick.Y,
      x2 = stick.X+ofsX,
      y2 = stick.Y-ofsY,
      width = stick.size/60,
      color = "#fff",
      stickPointsNumber = stick.stage / stick.size * maxStickPointsNumber;

  if (drawStyle === 0) {
    for (var i = 0; i < stickPointsNumber ; i++) {
      stage = i / stickPointsNumber;
      w = width * (1.8-stage); // *(Math.abs(stage - 0.5) * 2)
      if (w > 0.2) {
        drawCircle(ctx, (x2-x1)* stage + x1, (y2-y1)*stage + y1, w, color);
      }
    }
  } else if (drawStyle === 1) {
    drawLine(ctx, x1, y1, x2, y2, width, color);
  }

  // draw leaf
  if (stick.is_leaf) {
    drawCircle(ctx, stick.X+ofsX, stick.Y-ofsY, stick.size/10 + 0.5, "rgb(255,50,200)");
  }
}


function drawDotLine(ctx, x1, y1, x2, y2, width, color) {
  for (var i = 0; i < 7 ; i++) {
    drawCircle(ctx, i*(x2-x1)/7 + x1, i*(y2-y1)/7 + y1, width, color);
  }
}

function drawLine(ctx, x1, y1, x2, y2, width, color) {
  // console.log(x1);
  ctx.lineWidth=width;
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#fff';
  ctx.closePath();
  ctx.stroke();
}

function drawCircle(ctx, x, y, radius, color) {
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
}

function drawBackground(ctx) {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.fillStyle="black";
  ctx.fillRect(0,0,cnv.width,cnv.height);
}
