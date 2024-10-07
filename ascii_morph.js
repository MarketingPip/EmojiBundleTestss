/**
 * Ascii Morph
 * @author: Tim Holman (http://tholman.com)
 */
class AsciiMorph {
  constructor(element, canvasSize) {
    'use strict';
    this.element = element;
    this.canvasDimensions = canvasSize;
    this.renderedData = [];
    this.framesToAnimate = [];
    this.myTimeout = null;

    if (!this.element || !this.canvasDimensions) {
      console.log("sorry, I need an element and a canvas size");
    }
  }

  // Utils
  static extend(target, source) {
    for (const key in source) {
      if (!(key in target)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  static repeat(pattern, count) {
    if (count < 1) return '';
    let result = '';
    while (count > 1) {
      if (count & 1) result += pattern;
      count >>= 1, pattern += pattern;
    }
    return result + pattern;
  }

  static replaceAt(string, index, character) {
    return string.substr(0, index) + character + string.substr(index + character.length);
  }

  squareOutData(data) {
    let renderDimensions = { x: 0, y: data.length };

    // Calculate centering numbers
    for (let i = 0; i < data.length; i++) {
      if (data[i].length > renderDimensions.x) {
        renderDimensions.x = data[i].length;
      }
    }

    // Pad out right side of data to square it out
    for (let i = 0; i < data.length; i++) {
      if (data[i].length < renderDimensions.x) {
        data[i] = (data[i] + AsciiMorph.repeat(' ', renderDimensions.x - data[i].length));
      }
    }

    const paddings = {
      x: Math.floor((this.canvasDimensions.x - renderDimensions.x) / 2),
      y: Math.floor((this.canvasDimensions.y - renderDimensions.y) / 2)
    };

    // Left Padding
    for (let i = 0; i < data.length; i++) {
      data[i] = AsciiMorph.repeat(' ', paddings.x) + data[i] + AsciiMorph.repeat(' ', paddings.x);
    }

    // Pad out the rest of everything
    for (let i = 0; i < this.canvasDimensions.y; i++) {
      if (i < paddings.y) {
        data.unshift(AsciiMorph.repeat(' ', this.canvasDimensions.x));
      } else if (i > (paddings.y + renderDimensions.y)) {
        data.push(AsciiMorph.repeat(' ', this.canvasDimensions.x));
      }
    }

    return data;
  }

  // Crushes the frame data by 1 unit.
  getMorphedFrame(data) {
    let firstInLine, lastInLine = null;
    let found = false;

    for (let i = 0; i < data.length; i++) {
      const line = data[i];
      firstInLine = line.search(/\S/);
      if (firstInLine === -1) {
        firstInLine = null;
      }
      for (let j = 0; j < line.length; j++) {
        if (line[j] !== ' ') {
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
  }

  crushLine(data, line, start, end) {
    const centers = { x: Math.floor(this.canvasDimensions.x / 2), y: Math.floor(this.canvasDimensions.y / 2) };
    let crushDirection = 1;

    if (line > centers.y) {
      crushDirection = -1;
    }

    const charA = data[line][start];
    const charB = data[line][end];
    data[line] = AsciiMorph.replaceAt(data[line], start, " ");
    data[line] = AsciiMorph.replaceAt(data[line], end, " ");

    if (!((end - 1) === (start + 1)) && !(start === end) && !((start + 1) === end)) {
      data[line + crushDirection] = AsciiMorph.replaceAt(data[line + crushDirection], (start + 1), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
      data[line + crushDirection] = AsciiMorph.replaceAt(data[line + crushDirection], (end - 1), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
    } else if ((((start === end) || (start + 1) === end)) && ((line + 1) !== centers.y && (line - 1) !== centers.y && line !== centers.y)) {
      data[line + crushDirection] = AsciiMorph.replaceAt(data[line + crushDirection], (start), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
      data[line + crushDirection] = AsciiMorph.replaceAt(data[line + crushDirection], (end), '+*/\\'.charAt(Math.floor(Math.random() * '+*/\\'.length)));
    }
    return data;
  }

  render(data) {
    const ourData = this.squareOutData(data.slice());
    this.renderSquareData(ourData);
  }

  renderSquareData(data) {
    this.element.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
      this.element.innerHTML += data[i] + '\n';
    }
    this.renderedData = data;
  }

  // Morph between whatever is current, to the new frame
  morph(data) {
    clearTimeout(this.myTimeout);
    const frameData = this.prepareFrames(data.slice());
    this.animateFrames(frameData);
  }

  prepareFrames(data) {
    const deconstructionFrames = [];
    const constructionFrames = [];
    let clonedData = this.renderedData;

    // If it's taking more than 100 frames, it's probably somehow broken
    // Get the deconstruction frames
    for (let i = 0; i < 100; i++) {
      const newData = this.getMorphedFrame(clonedData);
      if (newData === false) {
        break;
      }
      deconstructionFrames.push(newData.slice(0));
      clonedData = newData;
    }

    // Get the construction frames for the new data
    const squareData = this.squareOutData(data);
    constructionFrames.unshift(squareData.slice(0));
    for (let i = 0; i < 100; i++) {
      const newData = this.getMorphedFrame(squareData);
      if (newData === false) {
        break;
      }
      constructionFrames.unshift(newData.slice(0));
      squareData = newData;
    }

    return deconstructionFrames.concat(constructionFrames);
  }

  animateFrames(frameData) {
    this.framesToAnimate = frameData;
    this.animateFrame();
  }

  animateFrame() {
    this.myTimeout = setTimeout(() => {
      this.renderSquareData(this.framesToAnimate[0]);
      this.framesToAnimate.shift();
      if (this.framesToAnimate.length > 0) {
        this.animateFrame();
      }
    }, 20); // framesToAnimate
  }
}
export default AsciiMorph;
