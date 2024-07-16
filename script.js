function numberVerify(num){
    if (num%2!=0) return Math.round(num/2)*2;
    else return num;
}

function activateButtons(dictionary){
    for (let button in dictionary) {
        let tempButton = document.querySelector(button);
        tempButton.addEventListener("click", function() {
            dictionary[button]();
        });
    }
}

function createGrid(width, height, rowNum, colNum, container){
    const hort = numberVerify(width);
    const vert = numberVerify(height);
    const refArr = [];
    container.style.width = `${hort*colNum}px`;
    container.style.height = `${vert*rowNum}px`;
    for (let i = 0; i < rowNum; i++) {
        let rowTemp = []
        for (let a = 0; a < colNum; a++) {
            let square = document.createElement("div");
            square.className = 'box';
            square.style.width = `${hort}px`;
            square.style.height = `${vert}px`;
            rowTemp.push(square);
            container.appendChild(square);
        }
        refArr.push(rowTemp);
    }
    return refArr;
}


function reset(gridElements, inputCells, activeCells){
    gridElements.forEach((spec) => {
        spec.forEach((item) => {
            item.className = 'box';
        });
    });
    Object.keys(inputCells).forEach(row => {
        delete inputCells[row];
    });
    Object.keys(activeCells).forEach(row => {
        delete activeCells[row];
    });
}

function neighboursToLoop(rowref, colref, maxRow, maxCol){
    toLoop = [];
    for (let i = rowref-1; i < rowref+2; i++) {
        if(0 <= i && i < maxRow){
            for (let a = colref-1; a < colref+2; a++) {
                if(0 <= a && a < maxCol){
                    if (!(i == rowref && a == colref)){toLoop.push([i,a]);}
                }
            }
        }
    }
    return toLoop;
}

function preset(row, col, inputCells, gameState){
    elementsArr = createGrid(20,20,row,col,container);
    elementsArr.forEach((row, rowref) => {
        row.forEach((item, colref) => {
            item.addEventListener("mousedown", ()=>{
                if (cellExists(rowref, colref, inputCells)) delete inputCells[rowref][colref];
                else addTo2dDict(rowref, colref, inputCells, 1)
                if (gameState.state == "pause") updateElement(elementsArr[rowref][colref]);
            });
        });
    });
    return elementsArr;
}

function updateElement(element){
    if (element.className == 'box') element.className = 'selected';
    else element.className = 'box';
}

function updateElementsFromDict(elementsArr, dict){
    for (let rowref in dict) {
        rowref = parseInt(rowref);
        for (let colref in dict[rowref]) {
            colref = parseInt(colref);
            element = elementsArr[rowref][colref];
            if (element.className == 'box'){
                element.className = 'selected';
            }
            else element.className = 'box';
        }
    }
}

function updateElementsFromArray(elementsArr, arr){
    arr.forEach(([rowref,colref]) => {
        element = elementsArr[rowref][colref];
        if (element.className == 'box') element.className = 'selected';
        else element.className = 'box';
    });
}

function addTo2dDict(rowref, colref, dict, item){
    if (rowref in dict) dict[rowref][colref] = item;
    else dict[rowref] = {[colref]: item};
}

function cellExists(rowref, colref, dict){
    if (rowref in dict && colref in dict[rowref])  return true;
    else return false;
}

function recalculateCellNeighbours(rowref, colref, activeCells, mode, numRows, numCols){
    neighboursArr = neighboursToLoop(rowref,colref,numRows,numCols);
    if (mode == "add"){
        if (cellExists(rowref, colref, activeCells)){
            activeCells[rowref][colref][1] = "live";
        }
        else{
            addTo2dDict(rowref, colref, activeCells, [0, "live"]);
        }
        neighboursArr.forEach(([neighbourRow, neighbourCol]) => {
            if (cellExists(neighbourRow, neighbourCol, activeCells)){
                activeCells[neighbourRow][neighbourCol][0]++;
            }
            else addTo2dDict(neighbourRow, neighbourCol, activeCells, [1, "dead"]);
        });
    }
    else if(mode == "delete"){
        activeCells[rowref][colref][1] = "dead";
        neighboursArr.forEach(([neighbourRow, neighbourCol]) => {
            activeCells[neighbourRow][neighbourCol][0]--;
        });
        if (activeCells[rowref][colref][0] == 0) delete activeCells[rowref][colref];
    }
}

function start(elementsArr, inputCells, gameState, activeCells, numRows, numCols, firstEverIteration, firstIteration){
    gameState.state = "start";
    firstEverIteration.state = false;
    function loop(delay){
        setTimeout(function() {
            if(gameState.state == "start"){
                //if input has been added mid loop
                if (Object.keys(inputCells).length !== 0) {
                    //Merging inputCells with activeCells
                    const activeCellsCopy = JSON.parse(JSON.stringify(activeCells));
                    for (let rowref in inputCells) {
                        rowref = parseInt(rowref);
                        for (let colref in inputCells[rowref]) {
                            colref = parseInt(colref);
                            if (cellExists(rowref, colref, activeCellsCopy)){
                                if(activeCellsCopy[rowref][colref][1] == "live") recalculateCellNeighbours(rowref, colref, activeCells, "delete", numRows, numCols);
                                else recalculateCellNeighbours(rowref, colref, activeCells, "add", numRows, numCols);
                            }
                            else recalculateCellNeighbours(rowref, colref, activeCells, "add", numRows, numCols);
                        }
                    }
                    if(firstIteration.state) firstIteration.state = false;
                    else{
                        updateElementsFromDict(elementsArr, inputCells);
                    }
                    //resets input
                    Object.keys(inputCells).forEach(row => {
                        delete inputCells[row];
                    });
                } 
                //Checks activeCells, deletes, adds accordingly
                let toAdd = [], toRemove = [];
                for (let rowref in activeCells) {
                    rowref = parseInt(rowref);
                    for (let colref in activeCells[rowref]) {
                        colref = parseInt(colref);
                        let isLive = activeCells[rowref][colref][1] == "live";
                        if (isLive){
                            let overpopulated = activeCells[rowref][colref][0] > 3;
                            let underpopulated = activeCells[rowref][colref][0] < 2;
                            if(overpopulated || underpopulated) toRemove.push([rowref, colref]);
                        }
                        else{
                            let growth = activeCells[rowref][colref][0] == 3;
                            if(growth) toAdd.push([rowref, colref]);
                        }  
                    }
                }
                toAdd.forEach(([rowref, colref]) => {
                    recalculateCellNeighbours(rowref, colref, activeCells, "add", numRows, numCols);
                });
                toRemove.forEach(([rowref, colref]) => {
                    recalculateCellNeighbours(rowref, colref, activeCells, "delete", numRows, numCols);
                });
                updateElementsFromArray(elementsArr, toAdd);
                updateElementsFromArray(elementsArr, toRemove);
            }
            loop(delay);
        }, delay);
    }
    loop(100);
}

document.addEventListener("DOMContentLoaded",()=>{
    const row = 100;
    const col = 100;
    const container = document.querySelector("#container");
    let gameState = {state:"pause"};
    let firstIteration = {state:true};
    let firstEverIteration = {state:true};
    let inputCells = {};
    let activeCells = {};
    let elementsArr = preset(row, col, inputCells, gameState);
    let buttonsDict = {
        "#startButton": function(){
            if (firstEverIteration.state) start(elementsArr, inputCells, gameState, activeCells, row, col, firstEverIteration, firstIteration);
            else gameState.state = "start";
        },
        "#pauseButton": function(){
            gameState.state = "pause";
            firstIteration.state = true;
        },
        "#resetButton": function(){
            gameState.state = "pause";
            firstIteration.state = true;
            reset(elementsArr, inputCells, activeCells);
        },
    };
    activateButtons(buttonsDict);
});