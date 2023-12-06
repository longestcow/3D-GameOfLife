
let canvasSize = 800, cellSize = 80;
let grid = [],tGrid;
let _size = canvasSize/cellSize;
let rules = [[6], [1], 5, 0]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (0=Moore, 1=Von Neumann)
let cMode = 1; // color mode (0 = stage, 1=dist from centre)
let cX=_size/2,cY=_size/2,cZ=_size/2;
let maxDist;
function setup() {
  frameRate(30);
  let temp=[];
  temp=temp.sort();
  maxDist=temp[temp.length-1];
  for(let i = 0; i<_size; i++){
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance = round(random(1,50))===1;
        temp.push(distFromCentre(i,j,k));
        grid[i][j].push(new Cell((chance)?rules[2]:0, (chance)?color(255, map(distFromCentre(i,j,k),0,maxDist,0,255), 0):color(0,0,0,0)));
      }
    }
  }

  
  createCanvas(canvasSize,canvasSize,WEBGL);
  camera(-canvasSize,-canvasSize,-canvasSize);
  strokeWeight(0);
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

        if(cCell.stage!==0){ //alive
          if(!rules[0].includes(cCell.neighbourCount)){//did not survive
            tGrid[i][j][k]=new Cell(rules[2]-1,cCell.color,true);
          }
          push();
          translate(x,y,z);
          fill(cCell.color);
          box(cellSize);
          pop();
        }
        else if(rules[0].includes(cCell.neighbourCount)){
          
          tGrid[i][j][k]=new Cell(rules[2],color(random(255),random(255),random(255)));
        }
        else {
          tGrid[i][j][k]=new Cell(0, cCell.color);
          if(cCell.dying){
            cCell.dying=false;
          }
        }
        if(cCell.dying){
          cCell.stage-=cCell.stage===0?0:1;
        }

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
    this.neighbourCount=0;
  }

}

function distFromCentre(x,y,z){
  return Math.pow((Math.pow(cX - x, 2) + 
  Math.pow(cY - y, 2) + 
  Math.pow(cZ - z, 2) * 1.0), 0.5);
  
}
