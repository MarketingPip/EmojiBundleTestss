/**
 * Ascii Morph
 * @author: Tim Holman (http://tholman.com)
 */
var AsciiMorph = (function() {
    'use strict';

    function AsciiMorph(el, canvasSize) {
        this.element = el;
        this.canvasDimensions = canvasSize;
        this.renderedData = [];
        this.framesToAnimate = [];
        this.myTimeout = null;
    }

    /** * Utils */
    function extend(target, source) {
        for (var key in source) {
            if (!(key in target)) {
                target[key] = source[key];
            }
        }
        return target;
    }

    function repeat(pattern, count) {
        if (count < 1) return '';
        var result = '';
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    }

    function replaceAt(string, index, character) {
        return string.substr(0, index) + character + string.substr(index + character.length);
    }

    AsciiMorph.prototype.squareOutData = function(data) {
        var i;
        var renderDimensions = { x: 0, y: data.length };

        // Calculate centering numbers
        for (i = 0; i < data.length; i++) {
            if (data[i].length > renderDimensions.x) {
                renderDimensions.x = data[i].length;
            }
        }

        // Pad out right side of data to square it out
        for (i = 0; i < data.length; i++) {
            if (data[i].length < renderDimensions.x) {
                data[i] = (data[i] + repeat(' ', renderDimensions.x - data[i].length));
            }
        }

        var paddings = {
            x: Math.floor((this.canvasDimensions.x - renderDimensions.x) / 2),
            y: Math.floor((this.canvasDimensions.y - renderDimensions.y) / 2)
        };

        // Left Padding
        for (var i = 0; i < data.length; i++) {
            data[i] = repeat(' ', paddings.x) + data[i] + repeat(' ', paddings.x);
        }

        // Pad out the rest of everything
        for (var i = 0; i < this.canvasDimensions.y; i++) {
            if (i < paddings.y) {
                data.unshift(repeat(' ', this.canvasDimensions.x));
            } else if (i > (paddings.y + renderDimensions.y)) {
                data.push(repeat(' ', this.canvasDimensions.x));
            }
        }
        return data;
    };

    // Crushes the frame data by 1 unit.
    AsciiMorph.prototype.getMorphedFrame = function(data) {
        var firstInLine, lastInLine = null;
        var found = false;

        for (var i = 0; i < data.length; i++) {
            var line = data[i];
            firstInLine = line.search(/\S/);
            if (firstInLine === -1) {
                firstInLine = null;
            }
            for (var j = 0; j < line.length; j++) {
                if (line[j] != ' ') {
                    lastInLine = j;
                }
            }
            if (firstInLine !== null && lastInLine !== null) {
                data = this.crushLine(data, i, firstInLine, lastInLine);
                found = true;
            }
            firstInLine = null;
            lastInLine = null;
        }
        return found ? data : false;
    };

    AsciiMorph.prototype.crushLine = function(data, line, start, end) {
        var centers = {
            x: Math.floor(this.canvasDimensions.x / 2),
            y: Math.floor(this.canvasDimensions.y / 2)
        };
        var crushDirection = 1;
        if (line > centers.y) {
            crushDirection = -1;
        }

        var charA = data[line][start];
        var charB = data[line][end];
        data[line] = replaceAt(data[line], start, " ");
        data[line] = replaceAt(data[line], end, " ");

        if (!((end - 1) == (start + 1)) && !(start === end) && !((start + 1) === end)) {
            data[line + crushDirection] = replaceAt(data[line + crushDirection], (start + 1), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
            data[line + crushDirection] = replaceAt(data[line + crushDirection], (end - 1), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
        } else if ((((start === end) || (start + 1) === end)) && ((line + 1) !== centers.y && (line - 1) !== centers.y && line !== centers.y)) {
            data[line + crushDirection] = replaceAt(data[line + crushDirection], (start), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
            data[line + crushDirection] = replaceAt(data[line + crushDirection], (end), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
        }
        return data;
    };

    AsciiMorph.prototype.render = function(data) {
        var ourData = this.squareOutData(data.slice());
        this.renderSquareData(ourData);
    };

    AsciiMorph.prototype.renderSquareData = function(data) {
        this.element.innerHTML = '';
        for (var i = 0; i < data.length; i++) {
            this.element.innerHTML += data[i] + '\n';
        }
        this.renderedData = data;
    };

    // Morph between whatever is current, to the new frame
    AsciiMorph.prototype.morph = function(data) {
        clearTimeout(this.myTimeout);
        var frameData = this.prepareFrames(data.slice());
        this.animateFrames(frameData);
    };

    AsciiMorph.prototype.prepareFrames = function(data) {
        var deconstructionFrames = [];
        var constructionFrames = [];
        var clonedData = this.renderedData;

        // If its taking more than 100 frames, it's probably somehow broken
        for (var i = 0; i < 100; i++) {
            var newData = this.getMorphedFrame(clonedData);
            if (newData === false) {
                break;
            }
            deconstructionFrames.push(newData.slice(0));
            clonedData = newData;
        }

        // Get the construction frames for the new data
        var squareData = this.squareOutData(data);
        constructionFrames.unshift(squareData.slice(0));
        for (var i = 0; i < 100; i++) {
            var newData = this.getMorphedFrame(squareData);
            if (newData === false) {
                break;
            }
            constructionFrames.unshift(newData.slice(0));
            squareData = newData;
        }
        return deconstructionFrames.concat(constructionFrames);
    };

    AsciiMorph.prototype.animateFrames = function(frameData) {
        this.framesToAnimate = frameData;
        this.animateFrame();
    };

    AsciiMorph.prototype.animateFrame = function() {
        this.myTimeout = setTimeout(() => {
            this.renderSquareData(this.framesToAnimate[0]);
            this.framesToAnimate.shift();
            if (this.framesToAnimate.length > 0) {
                this.animateFrame();
            }
        }, 20);
    };

    return AsciiMorph;
})();
export default AsciiMorph;
