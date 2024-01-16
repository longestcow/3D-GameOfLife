
let canvasSize = 1000, cellSize=50, changeCellSize, cSizeSlider, fpsButton, fpsSlider;
let rules = [[2,3,4,5,6], [1,2,3,4,5], 10, true];// birthNeighbour, survivalNeighbour, deathFadeRate, neighbourMode (true=Moore, false=Von Neumann)

let cMode; // color mode (stage based, dist from centre)
let col1, col2;

let sMode=0; // start mode 0 == center, 1 == noise
let centerSize = 2;
let noiseStrength = 0.03; 
let threshold = 0.6;

let grid = [],neighbours=[];
let _size = canvasSize/cellSize,centre=_size/2;

let paused = false;
let pause,reset,nstep;

function setup() {
  document.body.style.zoom=0.9; //a bit of the canvas was falling below the screen so im just manually zooming out at the start
  frameRate(24);

  cSizeSlider = createSlider(10,100,50,1); cSizeSlider.position(1100,10);
  changeCellSize = createButton("Size - "+cSizeSlider.value()); changeCellSize.mousePressed(initArrays); changeCellSize.position(1020,10);

  fpsSlider = createSlider(1,60,24,1); fpsSlider.position(1100, 40);
  fpsButton = createButton("FPS - "+fpsSlider.value()); fpsButton.mousePressed(()=>{frameRate(fpsSlider.value());}); fpsButton.position(1020, 40);

  pause = createButton("⏸"); pause.mousePressed(pauseFunction); pause.position(1020,80);
  reset = createButton("⟳"); reset.mousePressed(initArrays); reset.position(1060,80);
  nstep = createButton("⏩︎"); nstep.mousePressed(stepFunction);  nstep.position(1100,80);

  cMode=createSelect(); cMode.option("Stage"); cMode.option("Depth"); cMode.selected("Depth"); cMode.position(1020, 130);
  
  col1 = createColorPicker(color(255,0,0)); col1.position(1090,125);
  col2 = createColorPicker(color(0,0,255)); col2.position(1140,125);



  createCanvas(canvasSize,canvasSize,WEBGL);
  initArrays();
  camera(-canvasSize,-canvasSize,-canvasSize);
  strokeWeight(0);
  
}

function draw() {
  if(!paused)
    step(); 
  changeCellSize.html("Size - "+cSizeSlider.value());
  fpsButton.html("FPS - "+fpsSlider.value());
  orbitControl(2,2,1);
}


function step(){
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
          cCell.updateColor(i,j,k);
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
}

function initArrays(){
  cellSize=cSizeSlider.value();
  _size = canvasSize/cellSize,centre=_size/2;

  neighbours=[];
  grid=[];
  let cCell;
  for(let i = 0; i<_size; i++){ //fill neighbours array
    neighbours.push(new Array());
    for(let j = 0; j<_size; j++){
      neighbours[i].push(new Array());
      for(let k = 0; k<_size; k++)
        neighbours[i][j].push(0);
    }
  }

  background(220);
  let r = random(0,1);

  for(let i = 0; i<_size; i++){ //fill grid array with cells
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance;
        if(sMode===0)
          chance = (abs(i-centre)<=centerSize && abs(j-centre)<=centerSize && abs(k-centre)<=centerSize);
        else{
          let noiseValue = noise(i * noiseStrength + r, j * noiseStrength + r, k * noiseStrength + r);
          chance = (noiseValue > threshold);
        }

        grid[i][j].push(new Cell((chance)?rules[2]:0, lerpColor(col2.color(),col1.color(),map(distFromCentre(i,j,k),0,distFromCentre(0,0,0),0,1))));
        cCell=grid[i][j][k];
        if(chance){
          updateNeighbours(neighbours,i,j,k,true);
          push();
          translate(i*cellSize,j*cellSize,k*cellSize);
          cCell.updateColor(i,j,k);
          fill(cCell.color);
          box(cellSize);
          pop();
        }

      }
    }
  }

}

function pauseFunction(){
  paused=!paused;
  pause.html((paused)?"⏵︎":"⏸︎");
}
function stepFunction(){
  if(paused)step();
}



class Cell{
  constructor(stage,color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }

  updateColor(i,j,k) {//only for stage
    if(cMode.selected()==="Stage")
      this.color = lerpColor(col2.color(),col1.color(),map(this.stage,0,rules[2],0,1));
    else
      this.color = lerpColor(col2.color(),col1.color(),map(distFromCentre(i,j,k),0,distFromCentre(0,0,0),0,1));

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
