// setup canvas stuff
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

// scaling between position and canvas
const simHorizLimit = 100.0;
const cScale = canvas.width / simHorizLimit;
const simWidth = canvas.width / cScale; // =100.0
const simHeight = canvas.height / cScale;

let canvasObj = {
  ctx: ctx,
  cScale: cScale,
  sW: simWidth,
  sH: simHeight,
  cXY: function(pos) {
	  return {
	  	x: pos.x * cScale,
	  	y: canvas.height - pos.y * cScale,
	  };
  },
  cXYrev: function(cPos) {
	  return {
	  	x: cPos.x / cScale,
	  	y: (canvas.height - cPos.y) / cScale,
	  };
  },
  drawVert: function(pos) {
    let cPos = this.cXY(pos);
	  this.ctx.beginPath();
	  this.ctx.arc(
      cPos.x, cPos.y,
      this.cScale * 0.4,
      0.0, 2.0 * Math.PI); 
	  this.ctx.closePath();
	  this.ctx.fillStyle = "#000000";
	  this.ctx.fill();
  },
  drawEdge: function(pos1,pos2) {
    let cPos1 = this.cXY(pos1);
    let cPos2 = this.cXY(pos2);
    this.ctx.beginPath();
    this.ctx.moveTo(cPos1.x,cPos1.y);
    this.ctx.lineTo(cPos2.x,cPos2.y);
    this.ctx.stroke();
  },
};


// draw -------------------------------------------------------

const tau = new Triangulation();

const curMousePos = {x: 0, y: 0};

canvas.addEventListener('mousedown', (e) => {
  let pos = canvasObj.cXYrev({x:e.offsetX,y:e.offsetY});
  console.log('this.V in eventlistener, before:', tau.V);
  console.log('this.V in eventlistener, before:', tau.V[0]);
  tau.InsertVertStarOnly(pos);
  console.log('this.V in eventlistener, end:', tau.V);
  console.log('this.V in eventlistener, end:', tau.V[0]);
});
canvas.addEventListener('mousemove', (e) => {
  let pos = canvasObj.cXYrev({x:e.offsetX,y:e.offsetY});
  curMousePos.x = pos.x;
  curMousePos.y = pos.y;
});



function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

  let curFace = tau.FindFaceContainPoint(curMousePos);
  let curVert = tau.FindVertContainPoint(curMousePos);
  ctx.fillText(`Face: ${curFace}`, 10, 20);
  ctx.fillText(`Vert: ${curVert}`, 10, 30);

  for (let v = 0; v < tau.V.length; ++v) {
    if (tau.Vcoord[v] === null)
      continue;
    
    canvasObj.drawVert(tau.Vcoord[v]);
  }

  for (let f = 0; f < tau.F.length; ++f) {
    if (tau.F[f] === null)
      continue;

    for (let i = 0; i < 3; ++i) {
      canvasObj.drawEdge(
        tau.Vcoord[tau.F[f][i]],
        tau.Vcoord[tau.F[f][(i+1)%3]]);
    }
  }
}

let animateBool = true;
function update() {
	if (!animateBool) {
		return;
	}
	draw();
	requestAnimationFrame(update);
}

update();

//=======================================
// deal with buttons

function pauseAnim() {
	animateBool = false;
}

function playAnim() {
	animateBool = true;
	update();
}

function playPauseAnim() {
  const bt = document.getElementById("buttonAnim");
    if (animateBool) {
      pauseAnim();
      bt.innerHTML = "Play";
    }
    else {
      playAnim();
      bt.innerHTML = "Pause";
    }
}
