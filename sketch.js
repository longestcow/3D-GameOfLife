
let canvasSize = 1000, cellSize=50, changeCellSize, cSizeSlider, fpsButton, fpsSlider;

let cMode; // color mode (stage based, dist from centre)
let col1, col2;

let sMode; // start mode 0 == center, 1 == noise
let centerSize = 2, centerSizeInput;
let noiseStrength = 0.03, noiseStrengthInput; 
let threshold = 0.6, thresholdInput;

let grid = [],neighbours=[];
let _size = canvasSize/cellSize,centre=_size/2;

let paused = false;
let pause,reset,nstep;

let birth, survival, fadeRate, nMode, fadeRateText;

function setup() {
  document.body.style.zoom=0.9; //a bit of the canvas was falling below the screen so im just manually zooming out at the start
  frameRate(24);

  makeUI();

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
  fadeRateText.html("Fade-rate: "+fadeRate.value());
  orbitControl(2,2,1);
}


function step(){
  background(220);
  let i,j,k,cCell;
  let tGrid = structuredClone(grid); //create clones of grid and neighbour array. we will be making changes to the clones while reading stuff from the actual array, so that the change of one cell in a give step doesnt affect how another cell would change
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
          if(cCell.stage!==fadeRate.value() || !survival.value().includes(n)){//alive stays/starts dying
            tGrid[i][j][k]=new Cell(cCell.stage-1, cCell.color);
            if(cCell.stage-1==0)updateNeighbours(tNeighbours,i,j,k,false);//alive becomes dead
          }
          else if(survival.value().includes(n))//alive stays alive
            tGrid[i][j][k]=new Cell(cCell.stage, cCell.color);
        }
        else if(birth.value().includes(n)){//dead becomes alive
          tGrid[i][j][k]=new Cell(fadeRate.value(), cCell.color);
          updateNeighbours(tNeighbours,i,j,k,true);
        }
        else //dead stays dead
          tGrid[i][j][k]=new Cell(0, cCell.color);

      }
    }
  }
  neighbours=tNeighbours;//update grids
  grid=tGrid;
}

function initArrays(){ //initialize (or refill) all the arrays
  cellSize=cSizeSlider.value();
  _size = canvasSize/cellSize,centre=_size/2;

  centerSize=int(centerSizeInput.value())-1;
  noiseStrength=float(noiseStrengthInput.value());
  threshold=float(thresholdInput.value());

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

  background(220);//draw the grid once, so that it updates even if the state is paused
  let r = random(0,1);

  for(let i = 0; i<_size; i++){ //fill grid array with cells
    grid.push(new Array());
    for(let j = 0; j<_size; j++){
      grid[i].push(new Array());
      for(let k = 0; k<_size; k++){
        let chance;
        if(sMode.value()==="Center")
          chance = (abs(i-centre)<=centerSize && abs(j-centre)<=centerSize && abs(k-centre)<=centerSize);
        else{
          let noiseValue = noise(i * noiseStrength + r, j * noiseStrength + r, k * noiseStrength + r);
          chance = (noiseValue > threshold);
        }

        grid[i][j].push(new Cell((chance)?fadeRate.value():0, lerpColor(col2.color(),col1.color(),map(distFromCentre(i,j,k),0,distFromCentre(0,0,0),0,1))));
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

function makeUI(){ //all the gross ui stuff that i dont want anywhere near my code
  //size of the cells (inversely size of the grid)
  cSizeSlider = createSlider(10,100,50,1); cSizeSlider.position(1100,10);
  changeCellSize = createButton("Size - "+cSizeSlider.value()); changeCellSize.mousePressed(initArrays); changeCellSize.position(1020,10);
  //fps control
  fpsSlider = createSlider(1,60,24,1); fpsSlider.position(1100, 40);
  fpsButton = createButton("FPS - "+fpsSlider.value()); fpsButton.mousePressed(()=>{frameRate(fpsSlider.value());}); fpsButton.position(1020, 40);

  //control buttons
  pause = createButton("⏸"); pause.mousePressed(pauseFunction); pause.position(1020,80);
  reset = createButton("⟳"); reset.mousePressed(initArrays); reset.position(1060,80);
  nstep = createButton("⏩︎"); nstep.mousePressed(stepFunction);  nstep.position(1100,80);

  //color variables
  let cModeText=createP("Color-mode: ");cModeText.position(1020, 114);
  cMode=createSelect(); cMode.option("Stage"); cMode.option("Depth"); cMode.selected("Depth"); cMode.position(1110, 130);
  col1 = createColorPicker(color(255,0,0)); col1.position(1180,125);
  col2 = createColorPicker(color(0,0,255)); col2.position(1230,125);

  //starting state variables
  let sModeText=createP("Starting-state: "); sModeText.position(1020, 155);
  sMode=createSelect(); sMode.option("Center"); sMode.option("Noise"); sMode.selected("Center"); sMode.position(1120, 170);
  centerSizeInput = createInput("2"); centerSizeInput.position(1105, 195); centerSizeInput.size(25); 
  let centerSizeText = createP("Center Size: "); centerSizeText.position(1020, 180);
  noiseStrengthInput = createInput("0.03"); noiseStrengthInput.position(1125, 215); noiseStrengthInput.size(30); 
  let noiseStrengthText = createP("Noise Strength: "); noiseStrengthText.position(1020, 200);
  thresholdInput = createInput("0.6"); thresholdInput.position(1095, 235); thresholdInput.size(30); 
  let thresholdText = createP("Threshold: "); thresholdText.position(1020, 220);

  //ruleset variables
  birth = createInput("1"); birth.position(1070, 290); birth.size(100); 
  let birthText = createP("Birth: "); birthText.position(1020,275);
  survival = createInput("1"); survival.position(1090, 315); survival.size(100); 
  let survivalText = createP("Survival: "); survivalText.position(1020,300);
  fadeRate = createSlider(1,100,10,1); fadeRate.position(1110, 340);
  fadeRateText = createP("Fade-rate: "+fadeRate.value()); fadeRateText.position(1020,325); 
  let nModeText = createP("Neighbour-mode: "); nModeText.position(1020,350);
  nMode = createSelect(); nMode.option("Moore"); nMode.option("Von Neumann"); nMode.selected("Von Neumann"); nMode.position(1140, 365)

}

class Cell{
  constructor(stage,color){//if stage == 0, dead
    this.stage=stage;
    this.color=color;
  }

  updateColor(i,j,k) {//update color every frame
    if(cMode.selected()==="Stage")
      this.color = lerpColor(col2.color(),col1.color(),map(this.stage,0,fadeRate.value(),0,1));
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

function updateNeighbours(neighb,x,y,z,alive){ //updates the neighbour array using the same index as the cell in the grid array
  for(let i = -1; i<=1; i++){
    for(let j = -1; j<=1; j++){
      for(let k = -1; k<=1; k++){
        if(nMode.selected()!=="Moore" && (abs(i)+abs(j)+abs(k)>1))continue; //von neumann check
        if(i==0 && j==0 && k==0)continue;//ignore self state
        try{
          neighb[x+i][y+j][z+k]+=(alive)?1:-1;
        } catch(e){}
      }
    }
  }
}



