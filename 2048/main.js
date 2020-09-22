// Taken this function (code snippet) from online sources (till line 95)
(function (window, document) {
    'use strict';
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    var xDown = null;
    var yDown = null;
    var xDiff = null;
    var yDiff = null;
    var timeDown = null;
    var startEl = null;
    function handleTouchEnd(e) {
        if (startEl !== e.target) return;
        var swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10);
        var swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);
        var timeDiff = Date.now() - timeDown;
        var eventType = '';
        var changedTouches = e.changedTouches || e.touches || [];

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                if (xDiff > 0) {
                    eventType = 'swiped-left';
                }
                else {
                    eventType = 'swiped-right';
                }
            }
        }
        else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (yDiff > 0) {
                eventType = 'swiped-up';
            }
            else {
                eventType = 'swiped-down';
            }
        }
        if (eventType !== '') {
            var eventData = {
                dir: eventType.replace(/swiped-/, ''),
                xStart: parseInt(xDown, 10),
                xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
                yStart: parseInt(yDown, 10),
                yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
            };
            startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));
            startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
        }
        xDown = null;
        yDown = null;
        timeDown = null;
    }
    function handleTouchStart(e) {
        if (e.target.getAttribute('data-swipe-ignore') === 'true') return;

        startEl = e.target;

        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
        xDiff = 0;
        yDiff = 0;
    }
    function handleTouchMove(e) {
        if (!xDown || !yDown) return;
        var xUp = e.touches[0].clientX;
        var yUp = e.touches[0].clientY;

        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
    }
    function getNearestAttribute(el, attributeName, defaultValue) {
        while (el && el !== document.documentElement) {

            var attributeValue = el.getAttribute(attributeName);

            if (attributeValue) {
                return attributeValue;
            }
            el = el.parentNode;
        }
        return defaultValue;
    }

}(window, document));

var WINNING_NUMBER = 2048;
var moves = 0;

alert("Hello guys! Here's another game! \n    '2048'\n\nTarget: " + WINNING_NUMBER + " block\n\nBasically, 2048 presents with a 4×4 grid. When you start the game, there will be two “tiles” on the grid, each displaying the number 2. You hit the arrow keys on the screen to move the tiles around — and also to generate new tiles, which will also be valued at 2. When two equal tiles collide, they combine to give you one greater tile that displays their sum. The more you do this, obviously, the higher the tiles get and the more crowded the board becomes. Your objective is to reach " + WINNING_NUMBER + " before the board fills up.");
alert("You can use the arrow keys on your keyboard if you are using computer. Else click the buttons to operate the blocks in your phone.\nWith the version-2 the swiping feature has been enabled for mobile phone users!\n\n                                                             JAI AIMU");

var dim = 4, box, blocks, blocknumber = [[], [], [], []], color = {}, left, right, down, up, body, replay, result, alpha = 0, yes, p, t5, won = "no,t2";

blocks = [];
for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
        blocks.push([i, j]);
        blocknumber[i][j] = 1;
    }
}

var r = 255;
var g = 90;
for (let i = 1; i <= 2048; i *= 2) {
    color[i] = [r, g, g - 90];
    r -= 15;
    g += 15;
}

window.onload = function () {
    p = document.getElementById("progress");
    document.getElementById("Loader").style.display = "none";
    document.getElementById("Game").style.display = "block";
    box = document.getElementById("box");
    body = document.getElementsByTagName("body")[0];
    document.getElementById("load").style.display = "none";
    replay = document.getElementById("replay");
    result = document.getElementById("result");
    yes = document.getElementById("yes");

    replay.style.display = "none";

    for (let i = 0; i < blocks.length; i++) {
        box.innerHTML += `<div class = 'block' id = 'b${blocks[i][0]}${blocks[i][1]}' style = 'top:${blocks[i][0] * 80}px;left:${blocks[i][1] * 80}px;'>`;
    }

    left = document.getElementById("l");
    right = document.getElementById("r");
    down = document.getElementById("d");
    up = document.getElementById("u");

    randomPlace();
    randomPlace();

    down.addEventListener('click', function () {
        moves++;
        DownClick();
        randomPlace();
    });
    up.addEventListener('click', function () {
        moves++;
        UpClick();
        randomPlace();
    });

    left.addEventListener('click', function () {
        moves++;
        LeftClick();
        randomPlace();
    });

    right.addEventListener('click', function () {
        moves++;
        RightClick();
        randomPlace();
    });
    var btn = document.getElementsByClassName("btn");
    for (let i = 0; i < 4; i++) {
        btn[i].addEventListener('click', function () {
            var audio = document.getElementById("audio");
            //audio.volume = 0.1;
            audio.play();
        });
    }

    var audio = document.getElementById("audio");
    //audio.volume = 0.1;
    box.addEventListener('swiped-left', function () {
        moves++;
        LeftClick();
        randomPlace();
    });
    box.addEventListener('swiped-right', function () {
        moves++;
        RightClick();
        randomPlace();
    });
    box.addEventListener('swiped-down', function () {
        moves++;
        DownClick();
        randomPlace();
    });
    box.addEventListener('swiped-up', function () {
        moves++;
        UpClick();
        randomPlace();
    });

    var t = setInterval(Update, 10);
    t2 = setInterval(GameReplay, 10);
    var t3 = setInterval(reset, 10);
    var t4 = setInterval(MyMoves, 10);
    t5 = setInterval(Rating, 10);
    var t6 = setInterval(F, 10);
};

window.addEventListener('keydown', function (e) {
    var audio = document.getElementById("audio");
    audio.volume = 0.4;
    if (e.key == "ArrowUp") {
        UpClick();
        randomPlace();
        audio.play();
        moves++;
    }
    if (e.key == "ArrowDown") {
        DownClick();
        randomPlace();
        audio.play();
        moves++;
    }
    if (e.key == "ArrowRight") {
        RightClick();
        randomPlace();
        audio.play();
        moves++;
    }
    if (e.key == "ArrowLeft") {
        LeftClick();
        randomPlace();
        audio.play();
        moves++;
    }
});


function randomPlace() {
    let val = 2;
    var count = 0;
    var a = Math.floor(Math.random() * dim);
    var b = Math.floor(Math.random() * dim);

    while (blocknumber[a][b] != 1) {
        count++;
        a = Math.floor(Math.random() * dim);
        b = Math.floor(Math.random() * dim);
        if (count > 500) {
            break;
        }
    }

    if (count < 500) {
        blocknumber[a][b] = val;
        let n = document.getElementById(`b${a}${b}`);
        n.style.background = `rgb(${color[val]})`;
        n.innerHTML = val;
    }
}

function DownClick() {
    var c = [0, 0, 0, 0];
    for (let i = blocknumber.length - 1; i > -1; i--) {
        for (let j = 0; j < blocknumber[i].length; j++) {
            if (blocknumber[i][j] != 1) {
                [blocknumber[i][j], blocknumber[dim - 1 - c[j]][j]] = [1, blocknumber[i][j]];
                c[j]++;
            }
        }
    }

    for (let i = blocknumber.length - 1; i > 0; i--) {
        for (let j = 0; j < blocknumber[i].length; j++) {
            if (blocknumber[i][j] == blocknumber[i - 1][j] && blocknumber[i][j] != 1) {
                blocknumber[i][j] *= 2;
                blocknumber[i - 1][j] = 1;
                DownClick();
            }
        }
    }
}

function UpClick() {
    var c = [0, 0, 0, 0];
    for (let i = 0; i < blocknumber.length; i++) {
        for (let j = 0; j < blocknumber[i].length; j++) {
            if (blocknumber[i][j] != 1) {
                [blocknumber[i][j], blocknumber[c[j]][j]] = [1, blocknumber[i][j]];
                c[j]++;
            }
        }
    }

    for (let i = 0; i < blocknumber.length - 1; i++) {
        for (let j = 0; j < blocknumber[i].length; j++) {
            if (blocknumber[i][j] == blocknumber[i + 1][j] && blocknumber[i][j] != 1) {
                blocknumber[i][j] *= 2;
                blocknumber[i + 1][j] = 1;
                UpClick();
            }
        }
    }
}

function LeftClick() {
    var c = [0, 0, 0, 0];
    for (let i = 0; i < blocknumber.length; i++) {
        for (let j = 0; j < blocknumber[i].length; j++) {
            if (blocknumber[i][j] != 1) {
                [blocknumber[i][j], blocknumber[i][c[i]]] = [1, blocknumber[i][j]];
                c[i]++;
            }
        }
    }

    for (let i = 0; i < blocknumber.length; i++) {
        for (let j = 0; j < blocknumber.length - 1; j++) {
            if (blocknumber[i][j] == blocknumber[i][j + 1] && blocknumber[i][j] != 1) {
                blocknumber[i][j] *= 2;
                blocknumber[i][j + 1] = 1;
                LeftClick();
            }
        }
    }
}

function RightClick() {
    var c = [0, 0, 0, 0];
    for (let i = 0; i < blocknumber.length; i++) {
        for (let j = blocknumber.length - 1; j > -1; j--) {
            if (blocknumber[i][j] != 1) {
                [blocknumber[i][j], blocknumber[i][dim - 1 - c[i]]] = [1, blocknumber[i][j]];
                c[i]++;
            }
        }
    }

    for (let i = 0; i < blocknumber.length; i++) {
        for (let j = blocknumber.length - 1; j > 0; j--) {
            if (blocknumber[i][j] == blocknumber[i][j - 1] && blocknumber[i][j] != 1) {
                blocknumber[i][j] *= 2;
                blocknumber[i][j - 1] = 1;
                RightClick();
            }
        }
    }
}

function Update() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            let n = document.getElementById(`b${i}${j}`);

            if (n !== null) {
                if (blocknumber[i][j] != 1) {
                    n.style.background = `rgb(${color[blocknumber[i][j]]})`;
                    n.innerHTML = blocknumber[i][j];
                }

                else {
                    n.style.background = "url('https://imgur.com/ZUVDeyS.jpg')";
                    n.style.filter = `brightness(100%)`;
                    n.innerHTML = "";
                }
            }
        }
    }
}

function CheckPair() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            try {
                if (blocknumber[i][j] == blocknumber[i + 1][j]) {
                    return true;
                }
            }
            catch (e) { }
            try {
                if (blocknumber[i][j] == blocknumber[i][j + 1]) {
                    return true;
                }
            }
            catch (e) { }
        }
    }
    return false;
}

function GameReplay() {
    var counts = 0;
    var win = 0;

    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            if (blocknumber[i][j] == 1) {
                counts++;
            }

            if (blocknumber[i][j] == WINNING_NUMBER) {
                win++;
            }
        }
    }

    if (win > 0) {
        clearInterval(t2);
        replay.style.display = "block";
        result.innerHTML = "YOU WON";
        won = true
        var t1 = setInterval(func, 100);
        yes.addEventListener('click', function () {
            clearInterval(t1);
            alpha = 0;
            won = "no";
            replay.style.display = "none";
            for (let i = 0; i < dim; i++) {
                for (let j = 0; j < dim; j++) {
                    blocknumber[i][j] = 1;
                }
            }

            moves = 0;
            result.innerHTML = "YOU LOST";
            randomPlace();
            randomPlace();
            t2 = setInterval(GameReplay, 10);
        });
    }

    else if (!CheckPair() && counts == 0) {
        clearInterval(t2);
        won = false;
        replay.style.display = "block";
        var t1 = setInterval(func, 100);
        yes.addEventListener('click', function () {
            clearInterval(t1);
            alpha = 0;
            replay.style.display = "none";
            won = "no";
            for (let i = 0; i < dim; i++) {
                for (let j = 0; j < dim; j++) {
                    blocknumber[i][j] = 1;
                }
            }

            moves = 0;
            randomPlace();
            randomPlace();
            t2 = setInterval(GameReplay, 10);
        });
    }
}

function func() {
    alpha += 0.02;
    result.style.color = `rgba(255,255,255,${alpha})`;
}

function reset() {
    var audio = document.getElementById("audio");
    if (audio.currentTime >= 1) {
        audio.pause();
        audio.currentTime = 0;
    }
}


function MyMoves() {
    var m = document.getElementById("moves");
    m.innerHTML = "Moves:" + moves;
}


function Rating() {
    var p = document.getElementById("progress");
    var rating = 0;
    var count1 = 0;
    var pair = 0;
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            if (blocknumber[i][j] == 1) {
                count1++;
            }
            let power = 0;
            let n = blocknumber[i][j];
            while (n > 1) {
                power++;
                n /= 2;
            }
            try {
                if (blocknumber[i][j] == blocknumber[i + 1][j]) {
                    rating += power / 2
                    pair++;
                }
            }
            catch (e) { }
            try {
                if (blocknumber[i][j] == blocknumber[i][j + 1]) {
                    rating += power / 2
                    pair++;
                }
            }
            catch (e) { }
            if (blocknumber[i][j] >= 16) {
                rating += power / 2;
            }
        }
    }
    if (count1 < 2) {
        rating -= 2;
    }
    if (count1 < 2 && pair < 2) {
        rating -= 3;
    }
    var l = []
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            l.push(blocknumber[i][j]);
        }
    }
    rating += Math.max(...l) / 32;
    if (Math.max(...l) >= 512) {
        rating += Math.max(...l) / 256;
    }

    if (Math.max(...l) >= 128) {
        rating += count1 * 1.5;
    }
    else {
        rating += count1
    }

    if (rating > 50 || won === true) {
        rating = 50;
    }
    if (rating < 0 || won === false) {
        rating = 0;
    }
    p.style.width = rating * 2 + "%";
}

function F() {
    audio.volume = 0.2;
}