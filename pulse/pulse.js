var margin = { top: 0, right: 0, bottom: 30, left: 0 };
var width = window.innerWidth;
var height = window.innerHeight - 40;
var portrait = height > width ? true : false;
var mobile = width > 800 ? false : true;
var hateNewShowing = false;
var loveNewShowing = false;
var muted = false;
var hateColor = 'rgb(0)';
var loveColor = 'rgb(220, 100, 100)';

// fetch APIs
var loveApi, hateApi;
var countsApi = "https://api182.patternbased.com/counts";
var tweetsApi = d3.json('https://api182.patternbased.com/tweets')
.then(data => {
    loveApi = data.loves;
    hateApi = data.hates;
  });

//// Right Panel Open Close
var rightPanel = d3.selectAll(".rightPanel");
var rightButton = d3.selectAll("rightButton");
var rightPOpen = false;

function rightPanelMove() {
    if(!rightPOpen) {
        rightPanel.style('right', 0);
    } else {
        rightPanel.style('right', '-120%');
    }
    rightPOpen = !rightPOpen;
}

function rightPanelClose() {
    rightPanel.style('right', '-120%');
    rightPOpen = false;
}

var svg = d3.selectAll(".wrapper").append("svg")
.attr("preserveAspectRatio", "none")
.attr("viewBox", `0 0 ${width} ${height}`)
.attr("class", "moodWrapper");

var rtime;
var timeout = false;
var delta = 200;
var ogWidth = window.innerWidth; var ogHeight = window.innerHeight - 40;
var newWidth, newHeight; var differenceX = 1; var differenceY = 1;

window.addEventListener('resize', ()=> {
    d3.selectAll(".moodWrapper").attr("viewBox", `0 0 ${width} ${height}`);
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        newWidth = document.body.clientWidth;
        newHeight = document.body.clientHeight - 40;
        differenceX = newWidth / ogWidth;
        differenceY = newHeight / ogHeight;
    }   
}

// Axis
var xScale = d3.scaleTime()
    .range([0, width])
    .nice();
var yScaleHate = d3.scaleLinear()
    .range([40, height * 0.75])
    .nice();
var yScaleLove = d3.scaleLinear()
    .range([height, height * 0.25 - 40])
    .nice();
var g = d3.selectAll(".moodWrapper").append('g');


// define the chart area and opening animation
var areaHateBefore = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(0)
    .y1((d) => { return yScaleHate(d.hatetweet *0); });
var areaHateMiddle = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(0)
    .y1((d) => { return yScaleHate(d.hatetweet *1.1); });
var areaHateMiddleTwo = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(0)
    .y1((d) => { return yScaleHate(d.hatetweet *0.96); });
var areaHate = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(0)
    .y1((d) => { return yScaleHate(d.hatetweet); });

var areaLoveBefore = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(height)
    .y1((d) => { return yScaleLove(d.lovetweet *0); });
var areaLoveMiddle = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(height)
    .y1((d) => { return yScaleLove(d.lovetweet *1.03); });
var areaLoveMiddleTwo = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(height)
    .y1((d) => { return yScaleLove(d.lovetweet *0.99); });
var areaLove = d3.area()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y0(height)
    .y1((d) => { return yScaleLove(d.lovetweet); });

// define the chart line for Date Handle
var lineHate = d3.line()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y((d) => { return yScaleHate(d.hatetweet); });
var lineLove = d3.line()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(d.date); })
    .y((d) => { return yScaleLove(d.lovetweet); });

//////// Render with Data
d3.json(countsApi)
.then(data => {
    // console.log(data);
    data.forEach(d => {    
    d.date = new Date(d.timeStamp);
    d.hatetweet = +d.hate;
    d.lovetweet = +d.love;
  })


// scale the range of the data
yScaleHate.domain([0, d3.max(data, (d) => { return d.lovetweet; })]);
yScaleLove.domain([0, d3.max(data, (d) => { return d.lovetweet; })]);
xScale.domain(d3.extent(data, (d) => { return new Date(d.date); }));

// Date formattings
var formatting = d3.timeFormat("%b %d %I%p");
var reverseDate = data.length -1;
var currentDate = formatting(data[reverseDate].date);
var currentHate = data[reverseDate].hatetweet;
var currentLove = data[reverseDate].lovetweet;

////////////////////////////////////
////////// Area Charts /////////////
////////////////////////////////////
var hatePool = g.append("g").attr("class","hatePool").style("opacity", 0.6);
var lovePool = g.append("g").attr("class","lovePool").style("opacity", 0.4);

hatePool.append("path")
       .data([data])
       .attr("class", "hateChart")
       .attr("d", areaHateBefore)
       .attr('fill', hateColor)
       .transition()
            .delay(800)
            .duration(2000)
            .attr("d", areaHateMiddle)
            .ease(d3.easeQuadInOut)
            .transition()
                .duration(700)
                .attr("d", areaHateMiddleTwo)
                .ease(d3.easeQuadInOut)
                .transition()
                .duration(500)
                .attr("d", areaHate)
                .ease(d3.easeQuadInOut);

lovePool.append("path")
       .data([data])
       .attr("d", areaLoveBefore)
       .attr('fill', loveColor)
       .transition()
            .delay(1600)
            .duration(3800)
            .attr("d", areaLoveMiddle)
            .ease(d3.easeQuadInOut)
            .transition()
                .duration(700)
                .attr("d", areaLoveMiddleTwo)
                .ease(d3.easeQuadInOut)
                .transition()
                .duration(500)
                .attr("d", areaLove)
                .ease(d3.easeQuadInOut);

// defining the valueline path
hatePool.append("path")
      .data([data])
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("d", lineHate);
lovePool.append("path")
      .data([data])
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "rgba(0,0,0,0)")
      .attr("d", lineLove);

// Opening bubble animations
    hateBubbles(0);
    loveBubbles(1000);

////////////////////////////////////
/////////// AXIS Ticks /////////////
////////////////////////////////////

// var xAxis = d3.axisBottom(xScale).ticks(mobile||portrait? 6 : null).tickFormat(d3.timeFormat("%d %b\n%H:00"));
var xAxis = d3.axisBottom(xScale).ticks(mobile||portrait? 6 : null).tickFormat(d3.timeFormat("%b %d %I%p"));
var xAxisG = g.append('g').call(xAxis)
    .attr("class", "x axis")
    .attr('transform', `translate( 50, ${mobile? height - 30 : height - 50})`)
    .selectAll('text')
        .style('fill', '#dddddd');
xAxisG.select('.domain').remove();

var yHateAxis = d3.axisLeft(yScaleHate).tickFormat(d3.format('.2s'));
var yHateG = g.append('g').call(yHateAxis)
    .attr("class", "y axis hate")
    .attr('transform', `translate( ${mobile? 20 : 30} , 0)`)
    .selectAll('text')
        .style('text-anchor', 'start')
        .style('fill', 'rgba(255,255,255,0.6)');
yHateG.attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .style('opacity',1)
        .transition()
            .delay(2000)
            .duration(500)
            .style('opacity',0.5);
yHateG.on("mouseover", function(){
            yHateG.style('opacity', 1)})
        .on("mouseout", function(){
            yHateG.style('opacity', 0.5)});
yHateG.select('.domain').remove();

var yLoveAxis = d3.axisRight(yScaleLove).tickFormat(d3.format('.2s'));
var yLoveG = g.append('g').call(yLoveAxis)
    .attr("class", "y axis love")
    .attr('transform', `translate( ${mobile? width - 20 : width - 40} , 0)`)
    .selectAll('text')
        .style('text-anchor', 'end')
        .style('fill', '#400000');
yLoveG.attr('opacity', 0)
        .transition()
        .delay(4000)
        .duration(500)
        .style('opacity', 1)
        .transition()
            .delay(2000)
            .duration(500)
            .style('opacity', 0.5);
yLoveG.on("mouseover", function(){
            yLoveG.style('opacity', 1)})
        .on("mouseout", function(){
            yLoveG.style('opacity', 0.5)});
yLoveG.select('.domain').remove();

////////////////////////////////////
////////// Hate vs Love ////////////
////////// Tweet Number ////////////
////////////////////////////////////

var hateNumber, loveNumber, selectedDate;
var hateG = d3.selectAll(".wrapper").append("g");
var hateText = hateG.append("text")
      .attr("class", "hateText")
      .text(0)
      .style('opacity',0)
      .on("mouseover", function(){
        hateFocus();})
      .on("mouseout", function(){
        hateUnFocus();})
      .transition()
        .delay(1000)
        .duration(500)
        .style('opacity',1);
hateText.transition()
    .tween("text", function() {
        var selection = d3.select(this);
        var start = d3.select(this).text();
        var end = currentHate;
        var interpolator = d3.interpolateNumber(start,end);
        return function(t) { selection.text(Math.round(interpolator(t))); };
    })
    .duration(2400);

var hateGAfter = d3.selectAll(".wrapper").append("g");
hateGAfter.append("text")
    .attr("class", "hateTextAfter")
    .text("Hate tweets on " + currentDate)
      .style('opacity',0)
      .transition()
        .delay(1000)
        .duration(500)
        .style('opacity',1);

var loveG = d3.selectAll(".wrapper").append("g");
var loveText = loveG.append("text")
      .attr("class", "loveText")
      .text(0)
      .style('opacity',0)
      .on("mouseover", function(){
        loveFocus();})
      .on("mouseout", function(){
        loveUnFocus();})
      .transition()
        .delay(4000)
        .duration(500)
        .style('opacity',1);
loveText.transition()
    .tween("text", function() {
        var selection = d3.select(this);
        var start = d3.select(this).text();
        var end = currentLove;
        var interpolator = d3.interpolateNumber(start,end);
        return function(t) { selection.text(Math.round(interpolator(t))); };
    })
    .duration(2400);

var loveGAfter = d3.selectAll(".wrapper").append("g");
loveGAfter.append("text")
    .attr("class", "loveTextAfter")
    .text("Love tweets on " + currentDate)
      .style('opacity',0)
      .transition()
        .delay(4000)
        .duration(500)
        .style('opacity',1);

////////////////////////////////////
//////////// Date Handle ///////////
////////////////////////////////////

var handleG = svg.append("g").attr("class", "handleG");
handleG.append("rect")
    .attr("class", "timeHandle")
    .attr("x", mobile ? width -40 : width -20 )
    .attr("y", 0)
    .attr("fill", "#ddd")
    .style('transform', differenceX < 1 ? `scale(${1/differenceX}, 1)` :`scale(1, 1)` )
    .style("position", "relative")
handleG.style('opacity',0)
    .transition()
      .delay(6000)
      .duration(500)
      .style('opacity',0.7)
                    .transition()
                        .delay(500)
                        .duration(500)
                        .style('opacity', mobile ? 0.3 : 0.5 );

handleG.append("path")
    .attr("class", "handleBump")
    .attr("d", "M30,200c-1-13.4-1.9-29.4-6.2-42.2c-4.1-12.2-8.3-19.9-15.2-31.9c-6.4-11.1-9.7-24-6.4-36.4c3.9-14.6,14.7-28.5,20.4-44.1C27.6,32.2,30,13.9,30,0V200z")
    .attr("fill", "#ddd")
    .attr("stroke", "#ddd")
    .attr("transform", "translate(" + (width -50) + ", 0)")
    .attr("width", "30px")
    .attr("height", "200px")
    .style("display", mobile ? "none" : "static" );


var deltaX, newX;
var dragHandler = d3.drag()
    .on("start", function () {
        var current = d3.select(this);
        deltaX = current.attr("x") - d3.event.x;
    })
    .on("drag", function () {
        newX = d3.event.x + deltaX;
        if(newX < 0) { newX = 0;}
        if(newX > width - 20) {newX = width - 20;}
        d3.select(this)
            .attr("x", newX);
    })
    .on("end", function() {
        //Get the location + data
        var location = ((width - newX)/width) * (data.length -1);
        var item = Math.round(location);
        var d1 = data[data.length -1 - item];
        hateNumber = d1.hatetweet;
        loveNumber = d1.lovetweet;
        selectedDate = formatting(d1.date);
        console.log(selectedDate, hateNumber, loveNumber);
        //Update Text
        loveG.selectAll("text").transition()
        .tween("text", function() {
            var selection = loveG.selectAll("text");
            var start = loveG.selectAll("text").text();
            var end = loveNumber;
            var interpolator = d3.interpolateNumber(start,end);
            return function(t) { selection.text(Math.round(interpolator(t))); };
        })
        .duration(1000);
        loveGAfter.selectAll("text")
        .remove();
        loveGAfter.append("text")
        .attr("class", "loveTextAfter")
        .text("Love tweets on " + selectedDate);
        hateG.selectAll("text").transition()
        .tween("text", function() {
            var selection = hateG.selectAll("text");
            var start = hateG.selectAll("text").text();
            var end = hateNumber;
            var interpolator = d3.interpolateNumber(start,end);
            return function(t) { selection.text(Math.round(interpolator(t))); };
        })
        .duration(1000);
        hateGAfter.selectAll("text")
        .remove();
        hateGAfter.append("text")
        .attr("class", "hateTextAfter")
        .text("Hate tweets on " + selectedDate);
        //Update Sound and Background
        soundUpdate(hateNumber, loveNumber);
        //Update Handle Bump position
        d3.selectAll(".handleBump").attr("x", newX -30);
        handleG.attr("x", newX -30);
        });
    dragHandler(svg.selectAll(".timeHandle"));

////////////////////////////////////
//////////// SOUND /////////////////
////////////////////////////////////

// Hate = hate.mp3 //
const playerHate = new Tone.Player("./sound/hate.mp3").toMaster();
playerHate.loop = true;
const playerLove = new Tone.Player("./sound/love.mp3").toMaster();
playerLove.loop = true;
const playerBigHate = new Tone.Player("./sound/bigHate.mp3").toMaster();
playerBigHate.loop = true;
const playerBigLove = new Tone.Player("./sound/bigLove.mp3").toMaster();
playerBigLove.loop = true;
const playerNewHate = new Tone.Player("./sound/newHate.mp3").toMaster();
const playerNewLove = new Tone.Player("./sound/newLove.mp3").toMaster();
playerNewHate.loop = false;
playerNewLove.loop = false;

/// Mute + Unmute button
const muteIcon = d3.select(".wrapper").append("div")
    .attr("class", "sound-icon")
    .on('click', function(){
        if(muted){
            soundUpdate(hateNumber || currentHate, loveNumber || currentLove);
            playerHate.mute = false;
            playerLove.mute = false;
            playerNewHate.mute = false;
            playerNewLove.mute = false;
            playerBigHate.mute = false;
            playerBigLove.mute = false;
            muted = false;
            muteIcon.style('background', 'url(./images/mute.svg)');
        } else {
            playerHate.mute = true;
            playerLove.mute = true;
            playerNewHate.mute = true;
            playerNewLove.mute = true;
            playerBigHate.mute = true;
            playerBigLove.mute = true;
            muted = true;
            muteIcon.style('background', 'url(./images/unmute.svg)');
        }
    });

////////////////////////////////////
//////////// START BUTTON //////////
////////////////////////////////////
const StartBtn = d3.select(".wrapper").append("div")
    .attr("class", "openingModal")
    .style('opacity',1)
    .html('<img src="./images/mute-dark.svg"><p>START</p>')
    .on("mouseover", function() {
        StartBtn.style('opacity', 0.5);
    })
    .on("mouseleave", function() {
        StartBtn.style('opacity', 1);
    })
    .on("click", function() {
        soundStart(currentHate, currentLove);
        StartBtn.transition().style('opacity',0);
        StartBtn.remove();
        muteIcon.style('background', 'url(./images/mute.svg)');
        
        showNewTweets();
    });

////////////////////////////////////
/////////// SOUND CONTROL //////////
////////////////////////////////////

function soundStart(hate, love) {
    var ratio = hate+love;
    ratio = ratio.toFixed(0);
    var maxHateValue = d3.max(data, (d) => { return d.hatetweet; });
    var maxLoveValue = d3.max(data, (d) => { return d.lovetweet; });
    var minHateValue = d3.min(data, (d) => { return d.hatetweet; });
    var minLoveValue = d3.min(data, (d) => { return d.lovetweet; });
    var totalHateRange = maxHateValue - minHateValue;
    var totalLoveRange = maxLoveValue - minLoveValue;
    var uniqueHateRange = hate - minHateValue;
    var uniqueLoveRange = love - minLoveValue;
    var uniqueHatePosition = uniqueHateRange / totalHateRange;
    var uniqueLovePosition = uniqueLoveRange / totalLoveRange;
    
    var ratioHate = (hate / ratio) *30 - 30; //Volume of Hate (in range of 0 to -30)
    ratioHate = ratioHate.toFixed(1);
    var ratioLove = (love / ratio) *30 - 30; //Volume of Love (in range of 0 to -30)
    ratioLove = ratioLove.toFixed(1);

    var valueHate = 1 - (hate / maxHateValue);
    valueHate = valueHate.toFixed(1);
    var valueBigHate = uniqueHatePosition *30 -30; //Volume of Big Hate
    valueBigHate = valueBigHate.toFixed(1);
    var valueBigLove = uniqueLovePosition *30 -30; //Volume of Big Love
    valueBigLove = valueBigLove.toFixed(1);

    playerBigHate.start();
    playerBigHate.volume.rampTo(-Infinity, 1);
    playerBigLove.start();
    playerBigLove.volume.rampTo(-Infinity, 1);

    if(uniqueHatePosition > 0.5) {
        playerBigHate.volume.rampTo(1 * valueBigHate, 1);
    }
    if(uniqueLovePosition > 0.5) {
        playerBigLove.volume.rampTo(1 * valueBigLove, 1);
    }
    playerHate.playbackRate = valueHate *2;
    playerHate.volume.rampTo(ratioHate, 1);
    playerLove.volume.rampTo(ratioLove, 1);
    playerHate.start();
    playerLove.start();
    
    // bGColor(uniqueHatePosition, maxHateValue, minHateValue, uniqueLovePosition, maxLoveValue, minLoveValue);
    bGColor(uniqueHatePosition, uniqueLovePosition);
        
    console.log('ratioHate (Volume of Hate) = ' + ratioHate + '\nratioLove (Volume of Love) = ' + ratioLove + '\nvalueHate (Playback Rate of Hate) = ' + valueHate + '\nvalueBigHate (Volume of BigHate) = ' + valueBigHate + '\nvalueBigLove (Volume of BigLove) = ' + valueBigLove );

}

function soundUpdate(hate, love) {
    var ratio = hate+love;
    ratio = ratio.toFixed(0);
    var maxHateValue = d3.max(data, (d) => { return d.hatetweet; });
    var maxLoveValue = d3.max(data, (d) => { return d.lovetweet; });
    var minHateValue = d3.min(data, (d) => { return d.hatetweet; });
    var minLoveValue = d3.min(data, (d) => { return d.lovetweet; });
    var totalHateRange = maxHateValue - minHateValue;
    var totalLoveRange = maxLoveValue - minLoveValue;
    var uniqueHateRange = hate - minHateValue;
    var uniqueLoveRange = love - minLoveValue;
    var uniqueHatePosition = uniqueHateRange / totalHateRange;
    var uniqueLovePosition = uniqueLoveRange / totalLoveRange;

    var ratioHate = (hate / ratio) *30 - 30; //Volume of Hate (in range of 0 to -30)
    ratioHate = ratioHate.toFixed(1);
    var ratioLove = (love / ratio) *30 - 30; //Volume of Love (in range of 0 to -30)
    ratioLove = ratioLove.toFixed(1);

    var valueHate = 1 - (hate / maxHateValue);
    valueHate = valueHate.toFixed(1);
    var valueBigHate = uniqueHatePosition *30 -30; //Volume of Big Hate
    valueBigHate = valueBigHate.toFixed(1);
    var valueBigLove = uniqueLovePosition *30 -30; //Volume of Big Love
    valueBigLove = valueBigLove.toFixed(1);

    if(!muted) {
        if(uniqueHatePosition > 0.5) {
                playerBigHate.volume.rampTo(1 * valueBigHate, 3);
        } else {
            playerBigHate.volume.rampTo(-Infinity, 2);
        }

        if(uniqueLovePosition > 0.5) {
                playerBigLove.volume.rampTo(1 * valueBigLove, 3);
        } else {
            playerBigLove.volume.rampTo(-Infinity, 2);
        }

        playerHate.playbackRate = valueHate *2;
        // playerLove.playbackRate = 1;
        playerHate.volume.rampTo(ratioHate, 1);
        playerLove.volume.rampTo(ratioLove, 1);
        // Tone.Transport.bpm.rampTo(ratio, 1);
    } else {}
    bGColor(uniqueHatePosition, uniqueLovePosition);

    console.log('ratioHate (Volume of Hate) = ' + ratioHate + '\nratioLove (Volume of Love) = ' + ratioLove + '\nvalueHate (Playback Rate of Hate) = ' + valueHate + '\nvalueBigHate (Volume of BigHate) = ' + valueBigHate + '\nvalueBigLove (Volume of BigLove) = ' + valueBigLove );
}

////////////////////////////////////
//////// BACKGROUND COLOR //////////
////////////////////////////////////

function bGColor(hate, love) {
    var hateRGB = scale(hate, 0, 1, 100, 30);
    var loveR = scale(hate, 0, 1, 85, 135);
    var loveGB = scale(hate, 0, 1, -20, 50);
    var thisR = scale(love, 0, 1, hateRGB, (hateRGB + loveR));
    var thisGB = scale(love, 0, 1, hateRGB, (hateRGB + loveGB));
    var thisBGColor = "rgb(" + thisR + "," + thisGB + "," + thisGB + ")";
    d3.selectAll(".moodWrapper")
        .style('background', thisBGColor)
        .style('background-image', 'url("./images/45-degree-fabric-light.png")');
        console.log("rgb(" + thisR + "," + thisGB + "," + thisGB + ")");
};

function scale(number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

////////////////////////////////////
/////// Bubbles + New Tweets ///////
////////////////////////////////////

//// Bubble Effects ////
function hateBubbles(dl) {
for(var i=1;i<10;i++){
    var randomCircle = Math.random();
    hatePool.append("circle")
      .attr("r", 5*i)
    //   .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("fill", hateColor)
      .attr('transform', `translate(${width*randomCircle}, -100) scale(${differenceY}, ${differenceX})`)
        .transition()
        .duration(2400)
        .delay(function(){return(dl + i*300*randomCircle)})
        .attr('transform', `translate(${width*randomCircle},${height+100}) scale(${differenceY}, ${differenceX})`)
        .ease(d3.easeLinear)
        .remove();
    }
}
function loveBubbles(dl) {
for(var i=1;i<10;i++){
    var randomCircle = Math.random();
    lovePool.append("circle")
      .attr("r", 5*i)
      .attr("fill", loveColor)
      .attr('transform', `translate(${width*randomCircle},${height+100}) scale(${differenceY}, ${differenceX})`)
        .transition()
        .duration(4600)
        .delay(function(){return(dl + i*300*randomCircle)})
        .attr('transform', `translate(${width*randomCircle}, -100) scale(${differenceY}, ${differenceX})`)
        .ease(d3.easeQuadIn)
        .remove();
    }
}
function miniHateBubbles(max) {
    for(var i=1;i<10;i++){
        var randomCircle = Math.random();
        var bubbleX = scale(randomCircle, 0, 1, (max - 40), (max + 60));
        hatePool.append("circle")
          .attr("r", 2*i)
          .attr("fill", hateColor)
          .attr('transform', `translate(${bubbleX}, -100) scale(${differenceY}, ${differenceX})`)
            .transition()
            .duration(3600)
            .delay(function(){return(i*600*randomCircle)})
            .attr('transform', `translate(${bubbleX},${height+100}) scale(${differenceY}, ${differenceX})`)
            .ease(d3.easeLinear)
            .remove();
        }
    }
function miniLoveBubbles(max) {
        for(var i=1;i<10;i++){
            var randomCircle = Math.random();
            var bubbleX = scale(randomCircle, 0, 1, (max - 30), (max + 70));
            lovePool.append("circle")
              .attr("r", 2*i)
              .attr("fill", loveColor)
              .attr('transform', `translate(${bubbleX},${height+100}) scale(${differenceY}, ${differenceX})`)
                .transition()
                .duration(4800)
                .delay(function(){return(i*770*randomCircle)})
                .attr('transform', `translate(${bubbleX}, -100) scale(${differenceY}, ${differenceX})`)
                .ease(d3.easeQuadInOut)
                .remove();
            }
        }

//// New Tweets ////
var randomtiming;
// var urlRegex = https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*);
var urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g;

var tweetTimeFormatting = d3.timeFormat("%b %d %I:%M%p");

function showNewTweets() {
        var lastNumber = loveApi.length -1;
        if(lastNumber > hateApi.length -1) {
            lastNumber = hateApi.length -1;
        }
        var latestLove = loveApi[lastNumber].text;
        var latestLoveTime = tweetTimeFormatting(new Date(loveApi[lastNumber].created_at));
        // var latestLoveUser = res[lastNumber].twitter_handle;
        console.log(latestLove, latestLoveTime);
        loveBubbles(0); 
        loveBubbles(1000); 
        loveNewTweet(latestLove, latestLoveTime);
        callbackHateNewTweet(lastNumber);

    // The second and repeat
    d3.interval(() => {
        lastNumber--;
        var latestLove = loveApi[lastNumber].text;
        var latestLoveTime = tweetTimeFormatting(new Date(loveApi[lastNumber].created_at));
        if (latestLove.includes("http")) {
            var latestLove = latestLove.replace(urlRegex, '');
        }
        // var latestLoveUser = res[lastNumber].twitter_handle;
        console.log(latestLove);
        loveBubbles(0); 
        loveBubbles(1000); 
        loveNewTweet(latestLove, latestLoveTime);
        callbackHateNewTweet(lastNumber);
        if (lastNumber == 0) {
            d3.json('https://api182.patternbased.com/tweets')
            .then(data => {
                loveApi = data.loves;
                hateApi = data.hates;
              })
              .then(()=>{console.log(loveApi, hateApi);})
              lastNumber = loveApi.length -1;
              if(lastNumber > hateApi.length -1) {
                  lastNumber = hateApi.length -1;
              }
        }
    }, 30000);

    // Hate tweet after Love tweet
    function callbackHateNewTweet(num) {
        randomtiming = Math.random() * 2000 - 1000;
        console.log(randomtiming);
    setTimeout(function() {
            var latestHate = hateApi[num].text;
            var latestHateTime = tweetTimeFormatting(new Date(hateApi[num].created_at));

            if (latestHate.includes("http")) {
                latestHate = latestHate.replace(urlRegex, '');
            }
            console.log(latestHate);
            hateBubbles(0); 
            hateBubbles(1000); 
            hateNewTweet(latestHate, latestHateTime);
        }, 15000 + randomtiming);
}}

function hateNewTweet(tweet, time) {
    var twitterString = tweet;
    d3.selectAll(".wrapper").append("div")
    .attr("class", "tweetLabel")
    .html("<img src='./images/hate.svg'/>")
    .style("top", "-50%")
    .style("opacity", 0.5)
    .transition()
        .duration(2600)
        .style("top", "100%")
        .style("opacity",0.1);
    d3.selectAll(".wrapper").append("div")
    .attr("class", "tweetWrap")
    .html("<h3>" + twitterString + "</h3><p><span>at " + time +"</span></p>")
    .style("top", "0%")
    .style("opacity",0)
    .transition()
        .duration(1200)
        .delay(1000)
        .style("top", "50%")
        .style("opacity",1)
        .transition()
            .delay(10000)
            .duration(500)
            .style("opacity", 0)
            .remove();
    playerNewHate.start();
};

function loveNewTweet(tweet, time) {
    var twitterString = tweet;
    d3.selectAll(".wrapper").append("div")
    .attr("class", "tweetLabel")
    .html("<img src='./images/love.svg'/>")
    .style("top", "100%")
    .style("opacity",0.5)
    .transition()
        .duration(2600)
        .style("top", "-50%")
        .style("opacity", 0);
    d3.selectAll(".wrapper").append("div")
    .attr("class", "tweetWrap")
    .html("<h3>" + twitterString + "</h3><p><span>at " + time +"</span></p>")
    .style("top", "100%")
    .style("opacity",0)
    .transition()
        .duration(1200)
        .delay(1000)
        .style("top", "50%")
        .style("opacity",1)
        .transition()
            .delay(10000)
            .duration(500)
            .style("opacity", 0)
            .remove();
    playerNewLove.start();
};

    d3.interval(() => {
            var maxHAll = d3.max(data, (d) => { return d.hatetweet; });
            var posObj = data.filter(e => e.hatetweet===maxHAll);
            var pos = d3.selectAll(".hatePool").append("circle")
            .attr("height", 2)
            .attr("width", 2)
            .attr("cx", xScale(posObj[0].date));
            var posX = pos._groups[0][0].cx.animVal.value
        
            miniHateBubbles(posX);
            }, 11111);
        
    d3.interval(() => {
            var maxLAll = d3.max(data, (d) => { return d.lovetweet; });
            var posObj = data.filter(e => e.lovetweet===maxLAll);
            var pos = d3.selectAll(".lovePool").append("circle")
            .attr("height", 2)
            .attr("width", 2)
            .attr("cx", xScale(posObj[0].date));
            var posX = pos._groups[0][0].cx.animVal.value
        
            miniLoveBubbles(posX);
            }, 7777); 

});

window.onload = function() {
    setTimeout(()=> {
    document.querySelector('.loadingSpinner, #modalBG').style.display = 'none';
    var mouseY = 0;
    svg.on('mousemove', function () {
        mouseY = d3.mouse(this)[1];
        mouseX = d3.mouse(this)[0];   
        currentX = d3.selectAll(".timeHandle").attr("x");
        distance = currentX - mouseX;
        d3.selectAll(".handleBump")
        .attr("transform", "translate(" + bumpTranslateX() + "," + (mouseY - 100) + ") scale(" + bumpScaleX() + ", 1)")
        ;
        function bumpTranslateX() {
            if (distance > 300) {
                return currentX - 30;
            } else if (distance > 0 && distance < 300) {
                return currentX - (30 * (distance/300));
            } else {
                return currentX;
            }
        }
        function bumpScaleX() {
            if (distance > 300) {
                return 1;
            } else if (distance > 0 && distance < 300) {
                return distance/300;
            } else {
                return 0;
            }
        }
    });
}, 5000)
}

 function hateFocus() {
    var hatePool = d3.selectAll('.hatePool');
    var hateAxis = d3.selectAll('.axis.y.hate').selectAll('text');
    var hateText = d3.selectAll('.hateText');
    var hateTextAfter = d3.selectAll('.hateTextAfter');
    hatePool.style('opacity', 1);
    hateAxis.style('fill', 'rgba(255,255,255,1)').style('opacity', 1);
    hateText.style('color', 'rgba(255,255,255,1)');
    hateTextAfter.style('color', 'rgba(255,255,255,1)');
 }

 function hateUnFocus() {
    var hatePool = d3.selectAll('.hatePool');
    var hateAxis = d3.selectAll('.axis.y.hate').selectAll('text');
    var hateText = d3.selectAll('.hateText');
    var hateTextAfter = d3.selectAll('.hateTextAfter');
    hatePool.style('opacity', 0.6);
    hateAxis.style('fill', 'rgba(255,255,255,0.6)').style('opacity', 0.5);
    hateText.style('color', 'rgba(255,255,255,0.6)');
    hateTextAfter.style('color', 'rgba(255,255,255,0.6)');
 }

 function loveFocus() {
    var lovePool = d3.selectAll('.lovePool');
    var loveAxis = d3.selectAll('.axis.y.love').selectAll('text');
    lovePool.style('opacity', 0.7);
    loveAxis.style('opacity', 1);
 }

 function loveUnFocus() {
    var lovePool = d3.selectAll('.lovePool');
    var loveAxis = d3.selectAll('.axis.y.love').selectAll('text');
    lovePool.style('opacity', 0.4);
    loveAxis.style('opacity', 0.5);
 }

 function showHandle() {
     var timeHandle = d3.selectAll('.timeHandle');
     var currentX = timeHandle.attr("x");
     timeHandle.attr("x", currentX)
     .transition()
        .duration(500)
        .attr("x", 100)
        .transition()
            .duration(1200)
            .delay(300)
            .attr("x", currentX);
 }