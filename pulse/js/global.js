//// Right Panel Open Close
var rightPanel = d3.selectAll(".rightPanel");
var rightButton = d3.selectAll("rightButton");
var rightPOpen = false;

function rightPanelMove() {
    if(!rightPOpen) {
        rightPanel.style('right', 0);
    } else {
        rightPanel.style('right', '-400px');
    }
    rightPOpen = !rightPOpen;
}

function rightPanelClose() {
    rightPanel.style('right', '-400px');
    rightPOpen = false;
}

var width = window.innerWidth;
var height = window.innerHeight - 40;