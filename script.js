// Global object for storing painting tool status
var pointer = {
    _state: 'select',
    _color: 'black',
    _mouseDownX: 0,
    _mouseDownY: 0,

    stateListener: function(val){},
    colorListener: function(val){},
    get state(){
        return this._state;
    },
    set state(val){
        this._state = val;
        this.stateListener(val);
    },

    get color(){
        return this._color;
    },
    set color(val){
        this._color = val;
        this.colorListener(val);
    },
    
    registerStateListener: function(listener){
        this.stateListener = listener;
    },
    registerColorListener: function(listener){
        this.colorListener = listener;
    }
}

function setSelectedColor(color){
    var c = document.getElementById("colorIndicator");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "color";
    ctx.fillRect(0, 0, 64, 64);
}

//Attach pointer state and color listener after DOM ready 
$(document).ready(function(){
    $('#pointerState').html(pointer.state);
    setSelectedColor("black");
    
    pointer.registerStateListener(function(val){
        $('#pointerState').html(pointer.state);
    })
    pointer.registerColorListener(function(val){
        var c = document.getElementById("colorIndicator");
        var ctx = c.getContext("2d");
        ctx.fillStyle = pointer.color;
        ctx.fillRect(0, 0, c.width, c.height);
    })

    var c = document.getElementById("paint");
    var ctx = c.getContext("2d");
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, c.width, c.height);

})

//TODO: repeatable disaster :-O
$('footer,header').click( function(){
    pointer.state = 'select';});

$('#rubberButton').click( function(){
    pointer.state = 'rubber';});

$('#fillButton').click( function(){
    pointer.state = 'fill';
});

$('#pencilButton').click( function(){
    pointer.state = 'pencil';});

$('#brushButton').click( function(){
    pointer.state = 'brush';});

$('#lineButton').click( function(){
   pointer.state = 'line';});

$('#rectangleButton').click( function(){
pointer.state = 'rectangle';});


$('#blackButton').click( function(){
    pointer.color = 'black'});

$('#redButton').click( function(){
    pointer.color = 'red'});

$('#whiteButton').click( function(){
    pointer.color = 'white'});

$('#yellowButton').click( function(){
    pointer.color = 'yellow'});    

$('#greenButton').click( function(){
    pointer.color = 'green'});

$('#blueButton').click( function(){
    pointer.color = 'blue'});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function draw(evt, canvasId, height, width) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    var pos = getMousePos(canvas, evt);
    context.fillStyle = pointer.color;
    context.fillRect (pos.x, pos.y, height, width);

}

//TODO: dodać wizualizację linii podczas rysowania - dodaj prezroczystą warstwę z odświeżaniem
function drawLine(evt, canvasId, endX, endY){
    var c = document.getElementById("paint");
    var ctx = c.getContext("2d");
    ctx.strokeStyle = pointer.color;
    ctx.beginPath();
    ctx.moveTo(pointer._mouseDownX, pointer._mouseDownY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawRectangle(evt, canvasId, endX, endY){
    var c = document.getElementById("paint");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = pointer.color;
    ctx.rect(pointer._mouseDownX, pointer._mouseDownY, endX-pointer._mouseDownX, endY-pointer._mouseDownY);
    ctx.stroke();
}


function bucket(c, position, fillingColor){
    var ctx = c.getContext("2d");
    var imgData = ctx.getImageData(0,0, c.width, c.height);
    
    var x = Math.floor(position.x);
    var y = Math.floor(position.y);

    var i = ((y * (imgData.width * 4)) + (x * 4));

    var startColor = [imgData.data[i],imgData.data[i+1],imgData.data[i+2]];

    fill(x, y, ctx, startColor, fillingColor, imgData);


    // TODO: Stack overflow issue - change the algorythm !
    function fill(x, y, ctx){
        var i = ((y * (imgData.width * 4)) + (x * 4));
        imgData.data[i] = fillingColor[0];
        imgData.data[i+1] = fillingColor[1];
        imgData.data[i+2] = fillingColor[2];
        imgData.data[i+3] = 255;
        ctx.putImageData(imgData, 0, 0);
    
        var iN = i - (imgData.width * 4);
        if((iN > 0) //upper bound
        && (imgData.data[iN] == startColor[0] &&
            imgData.data[iN + 1] == startColor[1] && 
            imgData.data[iN + 2] == startColor[2] )){
                fill(x, y - 1, ctx, startColor, fillingColor, imgData);          
        }
    
        iN = i + 4;
        if((((y * (imgData.width * 4)) + (imgData.width * 4)) - 4 > iN ) //right bound
                && (imgData.data[iN] == startColor[0] &&
                imgData.data[iN + 1] == startColor[1] && 
                imgData.data[iN + 2] == startColor[2] )){
                    fill(x + 1, y , ctx, startColor, fillingColor, imgData); }
    
        iN = i + (imgData.width * 4);
        if((imgData.width*imgData.height*4 > iN) //down bound  
        && (imgData.data[iN] == startColor[0] &&
        imgData.data[iN + 1] == startColor[1] && 
        imgData.data[iN + 2] == startColor[2] )){
            fill(x , y + 1, ctx, startColor, fillingColor, imgData); }
            
        iN = i - 4    
        if((((y * (imgData.width * 4))) < iN) //left bound  
        && (imgData.data[iN] == startColor[0] &&
        imgData.data[iN + 1] == startColor[1] && 
        imgData.data[iN + 2] == startColor[2] )){
            fill(x - 1 , y , ctx, startColor, fillingColor, imgData);         
        }
    }

}


//TODO: lot of repeatable code - clean it up!
$("#paint")
// Mouse button pressed
    .mousedown(function(){
        switch(pointer.state){
            case 'pencil':
                    $("#paint").on('mousemove',function(){
                        draw(event, 'paint', 1, 1);
                    }
                    );
                break;
            case 'rubber':
                    $("#paint").on('mousemove',function(){
                        draw(event, 'paint', 30, 30);
                    }
                    );
                break;
            case 'brush':
                    $("#paint").on('mousemove',function(){
                        draw(event, 'paint', 2, 8);
                    }
                    );
                break;
            case 'line':
                    var canvas = document.getElementById('paint');
                    var position = getMousePos(canvas, event);
                    pointer._mouseDownX = position.x;
                    pointer._mouseDownY = position.y;
                break;
            case 'rectangle':
                    var canvas = document.getElementById('paint');
                    var position = getMousePos(canvas, event);
                    pointer._mouseDownX = position.x;
                    pointer._mouseDownY = position.y;
                break;
            case 'fill':
                    var canvas = document.getElementById('paint');
                    var position = getMousePos(canvas, event);
                    var c = document.getElementById('paint');    
                    var d = document.getElementById('colorIndicator'); 
                    var dctx = d.getContext("2d");
                    var dimageData = dctx.getImageData(0,0, d.width, d.height);
                    console.log(dimageData);
                    var color = [dimageData.data[0], dimageData.data[1],dimageData.data[2]];
                    bucket(c, position, color);
                break;
                default:
        }
    })
// Mouse button released
.mouseup(function(){
    switch(pointer.state){
        case 'pencil':
            $("#paint").off('mousemove');
            break;
        case 'rubber':
            $("#paint").off('mousemove');
            break;
        case 'brush':
            $("#paint").off('mousemove');
            break;
        case 'line':
                var canvas = document.getElementById('paint');
                var position = getMousePos(canvas, event);
            drawLine(event, 'paint', position.x, position.y)
            break;
        case 'rectangle':
                var canvas = document.getElementById('paint');
                var position = getMousePos(canvas, event);
                drawRectangle(event, 'paint', position.x, position.y)
            break;
            default:
    }
    
    });

