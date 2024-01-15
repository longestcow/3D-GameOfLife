
let canvasSize = 1000, cellSize = 40;
let rules = [[0,1,6,7,8], [0,1,2,3,4,5,6], 5, false]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)

let cMode = 1; // color mode (0 = stage, 1=dist from centre)
let col1, col2;

let sMode = 0; // 0 == center, 1 == noise
let centerSize = 1;
let noiseStrength = 0.2; 
let threshold = 0.6;

let grid = [],neighbours=[];
let _size = canvasSize/cellSize;
let centre=_size/2;

function setup() {
  frameRate(24);
  col1 = color(255,0,0), col2 = color(0,0,255)
  print(_size);
  for(let i = 0; i<_size; i++){ //fill neighbours array
    neighbours.push(new Array());
    for(let j = 0; j<_size; j++){
      neighbours[i].push(new Array());
      for(let k = 0; k<_size; k++)
        neighbours[i][j].push(0);
    }
  }

  
  for(let i = 0; i<_size; i++){ //fill grid array with cells
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance;
        if(sMode===0)
          chance = (abs(i-centre)<=centerSize && abs(j-centre)<=centerSize && abs(k-centre)<=centerSize);
        else{
          let noiseValue = noise(i * noiseStrength, j * noiseStrength, k * noiseStrength );
          chance = (noiseValue > threshold);
        }

        grid[i][j].push(new Cell((chance)?rules[2]:0, lerpColor(col2,col1,map(distFromCentre(i,j,k),0,distFromCentre(0,0,0),0,1))));
        if(chance)
          updateNeighbours(neighbours,i,j,k,true);
      }
    }
  }

  
  createCanvas(canvasSize,canvasSize,WEBGL);
  camera(-canvasSize*2,-canvasSize,-canvasSize);
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
          if(cCell.stage!==0){ //draw cell if alive
            push();
            translate(i*cellSize,j*cellSize,k*cellSize);
            if(cMode===0)cCell.updateColor();//update color of cell if stage based
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
            tGrid[i][j][k]=new Cell(cCell.stage, cCell.color);
        }
        else if(rules[0].includes(n)){//dead becomes alive
          tGrid[i][j][k]=new Cell(rules[2], cCell.color);
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
  // noLoop();
}


class Cell{
  constructor(stage,color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }

  updateColor() {//only for stage
    this.color=lerpColor(col2,col1,map(this.stage,0,rules[2],0,1));
  }
}

function distFromCentre(x,y,z){
  return Math.sqrt(
    (x-centre)**2 +
    (y-centre)**2 +
    (z-centre)**2
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
