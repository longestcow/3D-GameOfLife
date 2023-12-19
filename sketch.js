
let canvasSize = 800, cellSize = 40;
let grid = [],tGrid;
let _size = canvasSize/cellSize;
let rules = [[5], [6], 5, 0]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (0=Moore, 1=Von Neumann)
let cMode = 1; // color mode (0 = stage, 1=dist from centre)
let cX=_size/2,cY=_size/2,cZ=_size/2;
let maxDist;
function setup() {
  frameRate(30);
  maxDist=distFromCentre(0,0,0);
  for(let i = 0; i<_size; i++){
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance = round(random(1,10))===1;
        grid[i][j].push(new Cell((chance)?rules[2]:0,color(255, map(distFromCentre(i,j,k),0,maxDist,0,255), 0)));
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
  for(let x = 0; x<width; x+=cellSize){
    i=x/cellSize;
    for(let y = 0; y<height; y+=cellSize){
      j=y/cellSize;
      for(let z = 0; z<height; z+=cellSize){
        k=z/cellSize;
        cCell=grid[i][j][k];
         if(cCell.stage!==0){ //alive
          push();
          translate(x,y,z);
          fill(cCell.color);
          box(cellSize);
          pop();
         }

      }
    }
  }
  orbitControl(2,2,1);
}

function keyPressed(){
  if(keyCode===32){//next gen
    let i,j,k,cCell;
    let tGrid = structuredClone(grid);
    for(let x = 0; x<width; x+=cellSize){
      i=x/cellSize;
      for(let y = 0; y<height; y+=cellSize){
        j=y/cellSize;
        for(let z = 0; z<height; z+=cellSize){
          k=z/cellSize;
          try{
          cCell=grid[i][j][k];
          }catch(e){}
          print(cCell.neighbourCount())
            if(cCell.stage!==0){ //alive
              if(!rules[1].includes(cCell.neighbC))//did not survive
                 tGrid[i][j][k]=new Cell(cCell.stage-1,cCell.color,true);
              else
                tGrid[i][j][k]=new Cell((cCell.dying)?cCell.stage-1:cCell.stage, cCell.color)
            }
            else if(rules[0].includes(cCell.neighbC))//can be alivened
              tGrid[i][j][k]=new Cell(rules[2],color(255, map(distFromCentre(i,j,k),0,maxDist,0,255), 0));
            else //dead stays dead
              tGrid[i][j][k]=new Cell(0, cCell.color);
        }
      }
    }
    grid=tGrid;
    draw();
  }
}

class Cell{
  constructor(stage, color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
    this.neighbC = 0;
  }

  neighbourCount(){
    let c = 0;
    for(let i = -1; i<=1; i++){
      for(let j = -1; j<=1; j++){
        for(let k = -1; k<=1; k++){
          if(i==1&&j==1)continue;
          try{
          if(grid[i][j][k].stage!=0)c++;
          }
          catch(e){}
        }
      }
    }
    this.neighbC=c;
    return c;
  }

}

function distFromCentre(x,y,z){
  return Math.sqrt(
    (x-cX)**2 +
    (y-cY)**2 +
    (z-cY)**2
  );
  
}
