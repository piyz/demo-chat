var log, state, entities, conn = {}, c1 = {}, c2 = {}, sender = "s" + Math.random().toString().slice(2);

var ws = (window.WebSocket === undefined)? window.MozWebSocket:window.WebSocket;

function openConnection() {
    if (conn.readyState === undefined || conn.readyState > 1) {
        conn = new ws('ws://html5labs-interop.cloudapp.net:4502/chat');

        conn.onopen = function () {
            state.toggleClass('success');
            state.text('Socket open');
        };

        conn.onmessage = function (event) {
            var message = JSON.parse(event.data);

            if (message.type == 'chat')  {
                if (message.sender != sender) {
                    cont = $("<li class='them'></li>");
                    cont.text(message.chat.replace(/[<>&]/g, function (m) { return entities[m]; }));
                    log.html(cont);
                    //log.html('<li class="them">' + message.chat.replace(/[<>&]/g, function (m) { return entities[m]; }) + '</li>' + log[0].innerHTML);
                }
            } else if (message.type == 'canvas') {
                if (message.sender != sen der) {
                    drawLine(message.part, message.line);
                }
            } else {
                $('#connected').text(message);
            }
        };

        conn.onclose = function (event) {
            state.toggleClass('fail');
            state.text('Socket closed');
        };
    }
}

$(document).ready(function () {
    log = $("#log");
    state = $('#status'),
        entities = {
            '<': '<',
            '>': '>',
            '&': '&'
        };

    if (ws === undefined) {
        state.text('Sockets not supported');
        state.addClass('fail');
    } else {
        state.onclick = function () {
            if (conn.readyState !== 1) {
                conn.close();
                setTimeout(function () {
                    openConnection();
                }, 250);
            }
        };

        $("#myform").submit(function (event) {
            event.preventDefault();

            // if we're connected
            if (conn.readyState === 1) {
                conn.send(JSON.stringify({
                    sender:sender,
                    type:'chat',
                    chat:$('#chat').val()
                }));

                log.html('<li class="you">'
                    + $('#chat').val().replace(/[<>&]/g, function (m) { return entities[m]; }) + '</li>' + log[0].innerHTML);

                $('#chat').value = '';
            }
        });

        openConnection();
    }

    initPainting();

    $(".view").each(function(e){
        $(this).bind("click", function(e) {
            $(this).parent().toggleClass("hidden");

            $(this).text(($(this).text() == "show")?"hide":"show");
        });
    });


});

function initPainting() {
    c1.source = $("#mycanvas");
    c1.part = 1;
    c1.context = c1.source[0].getContext("2d");

    c2.source = $("#othercanvas");
    c2.part = 2;
    c2.context = c2.source[0].getContext("2d");

    initCanvas(c1);
    initCanvas(c2);
}

function initCanvas(canvas) {
    var ctx = canvas.context;
    var c = canvas;
    canvas.isPainting = false;
    canvas.lastPoint = {};

    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    canvas.source.bind("mousedown", function(e) {
        canvas.isPainting = true;
        canvas.lastPoint = {x: e.offsetX, y: e.offsetY};
    });

    canvas.source.bind("mousemove", function(e) {
        if (canvas.isPainting) {
            var line = {x1:canvas.lastPoint.x, y1:canvas.lastPoint.y, x2: e.offsetX, y2: e.offsetY};
            drawLine(canvas.part, line);

            if (conn.readyState === 1) {
                conn.send(JSON.stringify({
                    sender:sender,
                    type:"canvas",
                    part:canvas.part,
                    line:line
                }));
            }

            canvas.lastPoint = {x: e.offsetX, y: e.offsetY};
        }
    });

    canvas.source.bind("mouseup", function(e) {
        canvas.isPainting = false;
    });
}

function drawLine(part, line) {
    var ctx = (part == 1) ? c1.context : c2.context;

    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);

    ctx.closePath();
    ctx.stroke();
};