
let canvasSize = 800, cellSize = 40;
let grid = [],tGrid;
let _size = canvasSize/cellSize;
//let rules = [[1,2,3,4,5,6], [3], [1], true]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)
let rules = [[1,2], [3], [2], true]; // birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)
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
        let chance = (i===_size/2 && j===_size/2 && k===_size/2);
        // let chance = (round(random(1,40)) === 1)
        grid[i][j].push(new Cell((chance)?rules[2]:0,color(255, map(distFromCentre(i,j,k),0,maxDist,0,255), 0)));
      }
    }
  }
//q5js
  
  createCanvas(canvasSize,canvasSize,WEBGL);
  camera(-canvasSize,-canvasSize,-canvasSize);
  strokeWeight(0);
}

function draw() {
  background(220);
  let i,j,k,cCell;
  let tGrid = structuredClone(grid);
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

         //nextgen stuff
         let n = cCell.neighbourCount(i,j,k);
         if(cCell.stage!==0){ //alive
           if(rules[1].includes(n))//did survive
              tGrid[i][j][k]=new Cell(cCell.stage,cCell.color);
           else
             tGrid[i][j][k]=new Cell(cCell.stage-1, cCell.color)
         }
         else if(rules[0].includes(n)){//can be brought back to life
           tGrid[i][j][k]=new Cell(rules[2],color(255, map(distFromCentre(i,j,k),0,maxDist,0,255), 0));
         }
           else //dead stays dead
           tGrid[i][j][k]=new Cell(0, cCell.color);

      }
    }
  }
  grid=tGrid;
  orbitControl(2,2,1);
}

// function keyPressed(){
//   if(keyCode===32){//next gen
//     let i,j,k,cCell;
//     for(let x = 0; x<width; x+=cellSize){
//       i=x/cellSize;
//       for(let y = 0; y<height; y+=cellSize){
//         j=y/cellSize;
//         for(let z = 0; z<height; z+=cellSize){
//           k=z/cellSize;
//           cCell=grid[i][j][k];

           
//         }
//       }
//     }
//     draw();
//   }
// }

class Cell{
  constructor(stage, color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }

  neighbourCount(x,y,z){
    let c = 0;
    for(let i = -1; i<=1; i++){
      for(let j = -1; j<=1; j++){
        for(let k = -1; k<=1; k++){
          if(!rules[3] && (abs(i)+abs(j)+abs(k)>1))continue; //von neumann
          if(i==0 && j==0 && k==0)continue;//self state
          try{
          if(grid[x+i][y+j][z+k].stage!==0)c++;
          } catch(e){}
        }
      }
    }
  

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
