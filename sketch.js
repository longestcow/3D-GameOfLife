
let canvasSize = 800, cellSize = 36;
let grid = [],neighbours=[];
let _size = canvasSize/cellSize;
let rules = [[2,4,5,6,7,8,9,10,11,12,13,14,15,21,22,23,24,25,26], [1,2,3,8,6,7,8,5,4,12,13,15], 2, false]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)
//let rules = [[1], [1,2,3], 10, false]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)
let cMode = 1; // color mode (0 = stage, 1=dist from centre)
let cX=_size/2,cY=_size/2,cZ=_size/2;
function setup() {
  print(_size)
  frameRate(24);
  let maxDist=distFromCentre(0,0,0);
  for(let i = 0; i<_size; i++){ //fill neighbours array
    neighbours.push(new Array());
    for(let j = 0; j<_size; j++){
      neighbours[i].push(new Array());
      for(let k = 0; k<_size; k++)
        neighbours[i][j].push(0);
    }
  }
  for(let i = 0; i<_size; i++){
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance = (abs(i-_size/2)<3 && abs(j-_size/2)<3 && abs(k-_size/2)<3);
        // let chance = (round(random(1,20)) === 1)
        grid[i][j].push(
          new Cell((chance)?rules[2]:0,
          color(map(distFromCentre(i,j,k),0,maxDist,0,125), 0, map(distFromCentre(i,j,k),0,maxDist,0,255)))
        );
        if(chance)updateNeighbours(neighbours,i,j,k,true);
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
  let tGrid = structuredClone(grid);
  let tNeighbours = structuredClone(neighbours);
  for(let i = 0; i<_size; i++){
    for(let j = 0; j<_size; j++){
      for(let k = 0; k<_size; k++){
        cCell=grid[i][j][k];
          if(cCell.stage!==0){ //alive
            push();
            translate(i*cellSize,j*cellSize,k*cellSize);
            fill(cCell.color);
            box(cellSize);
            pop();
          }

        //nextgen stuff
        let n = neighbours[i][j][k];
        if(cCell.stage!==0){ //alive
          if(cCell.stage!==rules[2] || !rules[1].includes(n)){//alive stays/starts dying
            tGrid[i][j][k]=new Cell(cCell.stage-1, cCell.color);
            if(cCell.stage-1==0)updateNeighbours(tNeighbours,i,j,k,false);//alive becomes dead
          }
          else if(rules[1].includes(n))//alive stays alive
            tGrid[i][j][k]=new Cell(cCell.stage,cCell.color);
        }
        else if(rules[0].includes(n)){//dead becomes alive
          tGrid[i][j][k]=new Cell(rules[2],cCell.color);
          updateNeighbours(tNeighbours,i,j,k,true);
        }
        else //dead stays dead
          tGrid[i][j][k]=new Cell(0, cCell.color);

      }
    }
  }
  neighbours=tNeighbours;
  grid=tGrid;
  orbitControl(2,2,1);
}


class Cell{
  constructor(stage, color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }
}

function distFromCentre(x,y,z){
  return Math.sqrt(
    (x-cX)**2 +
    (y-cY)**2 +
    (z-cY)**2
  );
  
}

function updateNeighbours(neighb,x,y,z,alive){
  for(let i = -1; i<=1; i++){
    for(let j = -1; j<=1; j++){
      for(let k = -1; k<=1; k++){
        if(!rules[3] && (abs(i)+abs(j)+abs(k)>1))continue; //von neumann
        if(i==0 && j==0 && k==0)continue;//self state
        try{
        neighb[x+i][y+j][z+k]+=(alive)?1:-1;
        } catch(e){}
      }
    }
  }
}
