
let canvasSize = 800, cellSize = 80;
let grid = [],tGrid;

let rules = [[0,6], [0,6], 5, 0]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (0=Moore, 1=Von Neumann)
let cMode = 1; // color mode (0 = stage, 1=dist from centre)
function setup() {
  frameRate(30);
  for(let i = 0; i<canvasSize/cellSize; i++){
    grid.push(new Array());
    for(let j = 0; j<canvasSize/cellSize; j++){
      grid[i].push(new Array());
      for(let k = 0; k<canvasSize/cellSize; k++){
        let chance = round(random(1,50))===1;
        grid[i][j].push(new Cell((chance)?rules[2]:0, (chance)?[random(255),random(255),random(255)]:[0]));
      }
    }
  }
  createCanvas(canvasSize,canvasSize,WEBGL);
  camera(-canvasSize,-canvasSize,-canvasSize);
  strokeWeight(0.5);
}

function draw() {
  background(220);
  let i,j,k,cCell;
  tGrid=structuredClone(grid);
  for(let x = 0; x<width; x+=cellSize){
    i=x/cellSize;
    for(let y = 0; y<height; y+=cellSize){
      j=y/cellSize;
      for(let z = 0; z<height; z+=cellSize){
        k=z/cellSize;
        cCell=grid[i][j][k];

        if(cCell.stage!==0){
          if(!rules[0].includes(cCell.neighbourCount())){
            tGrid[i][j][k]=new Cell(rules[2]-1,cCell.color,true);
          }
          else tGrid[i][j][k]=new Cell(cCell.stage, cCell.color);

        }
        else if(rules[0].includes(cCell.neighbourCount())){
          tGrid[i][j][k]=new Cell(rules[2],[random(255),random(255),random(255)]);
        }
        if(cCell.dying){cCell.stage-=(cCell.stage===0)?0:1;}
        push();
        translate(x,y,z);
        fill(cCell.color);
        box(cellSize);
        pop();
      }
    }
  }
  grid=tGrid;
  orbitControl(2,2,1);
}

class Cell{
  constructor(stage, color, dying=false){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
    this.dying=dying;
  }

  neighbourCount(){
    return 0; // neighbour count
  }

  distFromCentre(){
    return 0; // distance from centre
  }


}
