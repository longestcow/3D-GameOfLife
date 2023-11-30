let canvasSize = 800, cellSize = 80;
let grid = [];

let rules = [[6], [6], 5, 0]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (0=Moore, 1=Von Neumann)
let cMode = 1; // color mode (0 = stage, 1=dist from centre)
function setup() {
  for(let i = 0; i<canvasSize/cellSize; i++){
    grid.push(new Array(canvasSize/cellSize));
    for(let j = 0; j<canvasSize/cellSize; j++){
      grid[i].push(new Array(canvasSize/cellSize));
    }
  }
  createCanvas(canvasSize,canvasSize,WEBGL);
  camera(-canvasSize,-canvasSize,-canvasSize);
  strokeWeight(0.5);
}

function draw() {
  background(220);
  fill(0,0,0,0);
  for(let x = 0; x<width; x+=cellSize){
    for(let y = 0; y<height; y+=cellSize){
      for(let z = 0; z<height; z+=cellSize){
        
        push();
        translate(x,y,z);
        box(cellSize);
        pop();
      }
    }
  }
  orbitControl(2,2,1);
}

class Cell{
  constructor(stage, color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }

  neighbourCount(){
    return 0; // neighbour count
  }

  distFromCentre(){
    return 0; // distance from centre
  }


}
