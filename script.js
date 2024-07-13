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


function reset(gridElements){
    gridElements.forEach((spec) => {
        spec.forEach((item) => {
            item.className = 'box';
        });
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

function preset(row, col){
    let neighbourCounts = Array.from({ length: row }, () => Array(col).fill(0));
    let clickedBool = Array.from({ length: row }, () => Array(col).fill(false));
    let activeCells = [];
    elementsArr = createGrid(20,20,row,col,container);
    elementsArr.forEach((spec, rowref) => {
        spec.forEach((item, colref) => {
            item.addEventListener("mousedown", ()=>{
                if(!(clickedBool[rowref][colref])){
                    clickedBool[rowref][colref] = true
                    //adding cells, next make deleting
                    neighboursToLoop(rowref, colref, row, col).forEach(([y,x]) => {
                        neighbourCounts[y][x]++;
                    });
                    activeCells.push([rowref, colref]);
                    item.className = 'selected';
                }
            });
        });
    });
    return [neighbourCounts, activeCells, elementsArr, clickedBool];
}

function updateElements(elementsArr, activeCells){
    activeCells.forEach(([y,x]) => {
        elementsArr[y][x].className = 'selected';
    });
}

function deactivateElements(elementsArr, activeCells){
    activeCells.forEach(([y,x]) => {
        elementsArr[y][x].className = 'box';
    });
}

function recountNeighbours(neighbourCounts, activeCells){
    row = cellStates.length;
    col = cellStates[0].length;
    neighbourCounts = Array.from({ length: row }, () => Array(col).fill(0));
    activeCells.forEach(([y,x]) => {
        neighboursToLoop(y,x,row,col).forEach(([neighbourRow, neighbourCol]) => {
            neighbourCounts[neighbourRow][neighbourCol]++;
        });
    });
    return neighbourCounts;
}

function serialize(tupleArr){
    set = new Set();
    tupleArr.forEach(tuple => {
        set.add(`${tuple[0]},${tuple[1]}`);
    });
    return set;
}

function unserialize(set){
    arr = [];
    set.forEach(item => {
        let [num1, num2] = item.split(',').map(Number);
        arr.push([num1, num2]);
    });
    return arr;
}

function setNextStates(neighbourCounts, activeCells, elementsArr, cellStates){
    let row = elementsArr.length;
    let col = elementsArr[0].length;
    deactivateElements(elementsArr, activeCells);
    activeSerialized = serialize(activeCells);
    activeCells.forEach(([y,x]) => {
        if(neighbourCounts[y][x]> 3 || neighbourCounts[y][x] < 2){
            cellStates[y][x] = false;
            activeSerialized.delete(`${y},${x}`);
        }
        neighboursToLoop(y,x,row,col).forEach(([neighbourRow, neighbourCol]) => {
            if(!(cellStates[neighbourRow][neighbourCol]) && (neighbourCounts[neighbourRow][neighbourCol] == 3)){
                cellStates[neighbourRow][neighbourCol] = true;
                activeSerialized.add(`${neighbourRow},${neighbourCol}`);
            }
        });
    });
    activeCells = unserialize(activeSerialized);
    updateElements(elementsArr, activeCells);
    neighbourCounts = recountNeighbours(neighbourCounts, activeCells);
    return [neighbourCounts, activeCells, cellStates]; 
}

function start(neighbourCounts, activeCells, elementsArr, cellStates){
    function loop(delay){
        setTimeout(function() {
            [a,b,c] = setNextStates(neighbourCounts, activeCells, elementsArr, cellStates);
            neighbourCounts = a, activeCells = b, cellStates = c;
            loop(delay);
        }, delay);
    }
    loop(100);
}

document.addEventListener("DOMContentLoaded",()=>{
    const row = 100;
    const col = 100;
    const container = document.querySelector("#container");
    [neighbourCounts, activeCells, elementsArr, cellStates] = preset(row, col);
    let buttonsDict = {
        "#startButton": function(){start(neighbourCounts, activeCells, elementsArr, cellStates);},
        "#resetButton": function(){
            reset(elementsArr);
            neighbourCounts = Array.from({ length: col }, () => Array(row).fill(0));
        },
    };
    activateButtons(buttonsDict);
});