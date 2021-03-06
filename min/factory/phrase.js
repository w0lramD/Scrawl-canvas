import { constructors, cell, cellnames, styles, stylesnames, artefact } from '../core/library.js';
import { scrawlCanvasHold } from '../core/document.js';
import { mergeOver, pushUnique, xt, ensurePositiveFloat, ensureFloat, ensureString } from '../core/utilities.js';
import { requestCell, releaseCell } from './cell.js';
import { makeFontAttributes } from './fontAttributes.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';
const fontHeightCalculator = document.createElement('div');
fontHeightCalculator.style.padding = 0;
fontHeightCalculator.style.border = 0;
fontHeightCalculator.style.margin = 0;
fontHeightCalculator.style.height = 'auto';
fontHeightCalculator.style.lineHeight = 1;
fontHeightCalculator.style.boxSizing = 'border-box';
fontHeightCalculator.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwertyd0123456789QWERTY';
scrawlCanvasHold.appendChild(fontHeightCalculator);
const textEntityConverter = document.createElement('textarea');
const Phrase = function (items = {}) {
this.fontAttributes = makeFontAttributes(items);
delete items.font;
delete items.style;
delete items.variant;
delete items.weight;
delete items.stretch;
delete items.size;
delete items.sizeValue;
delete items.sizeMetric;
delete items.family;
this.entityInit(items);
this.glyphStyles = [];
this.dirtyText = true;
this.dirtyFont = true;
this.dirtyPathObject = true;
return this;
};
let P = Phrase.prototype = Object.create(Object.prototype);
P.type = 'Phrase';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);
let defaultAttributes = {
text: '',
exposeText: true,
lineHeight: 1.5,
letterSpacing: 0,
justify: 'left',
glyphStyles: [],
overlinePosition: 0.1,
overlineStyle: 'rgb(250,0,0)',
underlinePosition: 0.6,
underlineStyle: 'rgb(250,0,0)',
highlightStyle: 'rgba(250,218,94,0.4)',
boundingBoxColor: 'rgba(0,0,0,0.5)',
showBoundingBox: false,
textPath: '',
textPathPosition: 0,
textPathLoop: true,
addTextPathRoll: true,
textPathDirection: 'ltr',
treatWordAsGlyph: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['textPositions', 'textLines', 'textLineWidths', 'textLineWords', 'textGlyphs', 'textGlyphWidths', 'fontAttributes']);
P.finalizePacketOut = function (copy, items) {
let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
copy = mergeOver(copy, stateCopy);
let fontAttributesCopy = JSON.parse(this.fontAttributes.saveAsPacket(items))[3];
delete fontAttributesCopy.name;
copy = mergeOver(copy, fontAttributesCopy);
copy = this.handlePacketAnchor(copy, items);
return copy;
};
P.factoryKill = function () {
if (this.exposedTextHold) this.exposedTextHold.remove();
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.handleX = function (coord) {
if (coord != null) {
this.handle[0] = coord;
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
}
};
S.handleY = function (coord) {
if (coord != null) {
this.handle[1] = coord;
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
}
};
S.handle = function (x, y) {
this.setCoordinateHelper('handle', x, y);
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
};
D.handleX = function (coord) {
let c = this.handle;
c[0] = addStrings(c[0], coord);
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
};
D.handleY = function (coord) {
let c = this.handle;
c[1] = addStrings(c[1], coord);
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
};
D.handle = function (x, y) {
this.setDeltaCoordinateHelper('handle', x, y);
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
};
S.text = function (item) {
this.text = ensureString(item);
this.dirtyText = true;
this.dirtyPathObject = true;
};
P.permittedJustifications = ['left', 'right', 'center', 'full'];
S.justify = function (item) {
if (this.permittedJustifications.indexOf(item) >= 0) this.justify = item;
this.dirtyText = true;
this.dirtyPathObject = true;
};
S.width = function (item) {
this.dimensions[0] = item;
this.dirtyDimensions = true;
this.dirtyHandle = true;
this.dirtyPathObject = true;
this.dirtyText = true;
};
D.width = function (item) {
let c = this.dimensions;
c[0] = addStrings(c[0], item);
this.dirtyDimensions = true;
this.dirtyHandle = true;
this.dirtyPathObject = true;
this.dirtyText = true;
};
S.scale = function (item) {
this.scale = item;
this.dirtyDimensions = true;
this.dirtyHandle = true;
this.dirtyFont = true;
this.dirtyPathObject = true;
this.dirtyScale = true;
};
D.scale = function (item) {
this.scale += item;
this.dirtyDimensions = true;
this.dirtyHandle = true;
this.dirtyFont = true;
this.dirtyPathObject = true;
this.dirtyScale = true;
};
S.lineHeight = function (item) {
this.lineHeight = ensurePositiveFloat(item, 3);
if (this.lineHeight < 0.5) this.lineHeight = 0.5;
this.dirtyPathObject = true;
this.dirtyText = true;
};
D.lineHeight = function (item) {
this.lineHeight += ensureFloat(item, 3);
if (this.lineHeight < 0.5) this.lineHeight = 0.5;
this.dirtyPathObject = true;
this.dirtyText = true;
};
S.letterSpacing = function (item) {
this.letterSpacing = ensurePositiveFloat(item, 3);
this.dirtyPathObject = true;
this.dirtyText = true;
};
D.letterSpacing = function (item) {
this.letterSpacing += ensureFloat(item, 3);
if (this.letterSpacing < 0) this.letterSpacing = 0;
this.dirtyPathObject = true;
this.dirtyText = true;
};
S.overlinePosition = function (item) {
this.overlinePosition = ensureFloat(item, 3);
this.dirtyPathObject = true;
this.dirtyText = true;
};
D.overlinePosition = function (item) {
this.overlinePosition += ensureFloat(item, 3);
this.dirtyPathObject = true;
this.dirtyText = true;
};
S.underlinePosition = function (item) {
this.underlinePosition = ensureFloat(item, 3);
this.dirtyPathObject = true;
this.dirtyText = true;
};
D.underlinePosition = function (item) {
this.underlinePosition += ensureFloat(item, 3);
this.dirtyPathObject = true;
this.dirtyText = true;
};
S.textPath = function (item) {
this.textPath = item;
this.dirtyHandle = true;
this.dirtyText = true;
this.dirtyPathObject = true;
};
S.textPathPosition = function (item) {
if (this.textPathLoop) {
if (item < 0) item = Math.abs(item);
if (item > 1) item = item % 1;
this.textPathPosition = parseFloat(item.toFixed(6));
}
else this.textPathPosition = item;
};
D.textPathPosition = function (item) {
let newVal = this.textPathPosition + item;
if (this.textPathLoop) {
if (newVal < 0) newVal += 1;
if (newVal > 1) newVal = newVal % 1;
this.textPathPosition = parseFloat(newVal.toFixed(6));
}
else this.textPathPosition = newVal;
};
G.font = function () {
return this.fontAttributes.get('font');
};
S.font = function (item) {
this.fontAttributes.set({font: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.style = function () {
return this.fontAttributes.get('style');
};
S.style = function (item) {
this.fontAttributes.set({style: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.variant = function () {
return this.fontAttributes.get('variant');
};
S.variant = function (item) {
this.fontAttributes.set({variant: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.weight = function () {
return this.fontAttributes.get('weight');
};
S.weight = function (item) {
this.fontAttributes.set({weight: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.stretch = function () {
return this.fontAttributes.get('stretch');
};
S.stretch = function (item) {
this.fontAttributes.set({stretch: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.size = function () {
return this.fontAttributes.get('size');
};
S.size = function (item) {
this.fontAttributes.set({size: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.sizeValue = function () {
return this.fontAttributes.get('sizeValue');
};
S.sizeValue = function (item) {
this.fontAttributes.set({sizeValue: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
D.sizeValue = function (item) {
this.fontAttributes.deltaSet({sizeValue: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.sizeMetric = function () {
return this.fontAttributes.get('sizeMetric');
};
S.sizeMetric = function (item) {
this.fontAttributes.set({sizeMetric: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
G.family = function () {
return this.fontAttributes.get('family');
};
S.family = function (item) {
this.fontAttributes.set({family: item});
this.dirtyFont = true;
this.dirtyPathObject = true;
};
P.setGlyphStyles = function (args, ...pos) {
if (args && Array.isArray(pos)) {
let styles = this.glyphStyles,
slot, style, i, iz;
for (i = 0, iz = pos.length; i < iz; i++) {
slot = pos[i];
style = styles[slot];
if (!style) styles[slot] = args;
else mergeOver(style, args);
}
this.dirtyPathObject = true;
this.dirtyText = true;
}
return this;
};
P.getTextPath = function () {
let path = this.textPath;
if (path && path.substring) {
path = this.textPath = artefact[this.textPath];
if (path.type === 'Shape' && path.useAsPath) path.pathed.push(this.name);
else {
path = this.path = false;
}
}
return path;
};
P.cleanPathObject = function () {
this.dirtyPathObject = false;
if (!this.noPathUpdates || !this.pathObject) {
if (this.dirtyFont && this.fontAttributes) {
this.dirtyFont = false;
this.fontAttributes.buildFont(this.scale);
this.dirtyText = true;
this.dirtyMimicDimensions = true;
}
if (this.dirtyText) this.buildText();
if (this.dirtyHandle) this.cleanHandle();
let p = this.pathObject = new Path2D();
let handle = this.currentHandle,
dims = this.currentDimensions,
scale = this.currentScale,
x = -handle[0] * scale,
y = (-handle[1] * scale) - (this.textHeight / 2),
w = dims[0] * scale;
let h;
if (this.textLines) {
h = (this.textHeight * this.textLines.length * this.lineHeight) + (this.textHeight / 2);
}
else {
h = 20;
this.dirtyPathObject = true;
this.dirtyFont = true;
this.dirtyText = true;
this.dirtyMimicDimensions = true;
this.dirtyHandle = true;
}
p.rect(x, y, w, h);
}
};
P.buildText = function () {
this.dirtyText = false;
this.text = this.convertTextEntityCharacters(this.text);
this.calculateTextPositions(this.text);
if (this.exposeText) {
if (!this.exposedTextHold) {
let myhold = document.createElement('div');
myhold.id = `${this.name}-text-hold`;
this.exposedTextHold = myhold;
this.exposedTextHoldAttached = false;
}
this.exposedTextHold.textContent = this.text;
if (!this.exposedTextHoldAttached) {
if(this.currentHost && this.currentHost.controller && this.currentHost.controller.textHold) {
this.currentHost.controller.textHold.appendChild(this.exposedTextHold);
this.exposedTextHoldAttached = true;
}
}
}
};
P.convertTextEntityCharacters = function (item) {
let mytext = item.trim();
mytext = mytext.replace(/[\s\uFEFF\xA0]+/g, ' ');
textEntityConverter.innerHTML = mytext;
return textEntityConverter.value;
};
P.calculateTextPositions = function (mytext) {
let makeStyle = function (item) {
if (item.substring) {
let brokenStyle = false;
if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];
if (brokenStyle) return brokenStyle.getData(self, host, true);
else return item;
}
else return item.getData(self, host, true);
};
let myCell = requestCell(),
engine = myCell.engine;
let self = this,
host = (this.group && this.group.getHost) ? this.group.getHost() : myCell;
let textGlyphs,
textGlyphWidths = [],
textLines = [],
textLineWidths = [],
textLineWords = [],
textPositions = [],
spacesArray = [],
gStyle, gPos, item,
starts, ends, cursor, word, height,
space, i, iz, j, jz, k, kz;
let fragment, len, glyphArr, glyph, nextGlyph, glyphWidth, lineLen, totalLen,
singles = [],
pairs = [],
path = this.getTextPath(),
direction, loop, rotate;
let fontAttributes = this.fontAttributes,
glyphAttributes = fontAttributes.clone({});
let glyphStyles = this.glyphStyles;
let state = this.state,
fontLibrary = {},
fontArray = [];
let scale = this.currentScale,
dims = this.currentDimensions,
width = dims[0] * scale,
treatWordAsGlyph = this.treatWordAsGlyph,
lineHeight = this.lineHeight,
justify = this.justify,
handle, handleX, handleY;
let defaultFont = fontAttributes.update(scale),
defaultFillStyle = makeStyle(state.fillStyle),
defaultStrokeStyle = makeStyle(state.strokeStyle),
defaultSpace = this.letterSpacing * scale,
currentFont = defaultFont,
currentFillStyle = defaultFillStyle,
currentStrokeStyle = defaultStrokeStyle,
currentSpace = defaultSpace;
let highlightStyle = (this.highlightStyle) ? makeStyle(this.highlightStyle) : false,
highlightFlag = false;
let underlineStyle = (this.underlineStyle) ? makeStyle(this.underlineStyle) : false,
underlinePosition = this.underlinePosition,
underlineFlag = false;
let overlineStyle = (this.overlineStyle) ? makeStyle(this.overlineStyle) : false,
overlinePosition = this.overlinePosition,
overlineFlag = false;
let maxHeight = 0;
textGlyphs = (treatWordAsGlyph) ? this.text.split(' ') : this.text.split('');
fontArray.push(currentFont);
for (i = 0, iz = textGlyphs.length; i < iz; i++) {
item = textGlyphs[i];
textPositions[i] = [, , , , , , item, 0, 0, 0];
if (item === ' ') spacesArray.push(i);
}
if (!glyphStyles[0]) glyphStyles[0] = {
family: glyphAttributes.family,
size: (glyphAttributes.sizeValue) ? `${glyphAttributes.sizeValue}${glyphAttributes.sizeMetric}` : glyphAttributes.sizeMetric,
stretch: glyphAttributes.stretch,
style: glyphAttributes.style,
variant: glyphAttributes.variant,
weight: glyphAttributes.weight,
};
for (i = 0, iz = glyphStyles.length; i < iz; i++) {
gStyle = glyphStyles[i];
if (gStyle) {
gPos = textPositions[i];
if (i === 0) {
gPos[0] = currentFont;
gPos[1] = currentStrokeStyle;
gPos[2] = currentFillStyle;
gPos[3] = highlightFlag;
gPos[4] = underlineFlag;
gPos[5] = overlineFlag;
}
if (gStyle.defaults) {
currentFont = glyphAttributes.update(scale, fontAttributes);
currentStrokeStyle = defaultStrokeStyle;
currentFillStyle = defaultFillStyle;
currentSpace = defaultSpace;
gPos[0] = currentFont;
gPos[1] = currentStrokeStyle;
gPos[2] = currentFillStyle;
gPos[3] = highlightFlag;
gPos[4] = underlineFlag;
gPos[5] = overlineFlag;
}
item = gStyle.stroke;
if (item && item !== currentStrokeStyle) {
currentStrokeStyle = makeStyle(gStyle.stroke);
gPos[1] = currentStrokeStyle;
};
item = gStyle.fill;
if (item && item !== currentFillStyle) {
currentFillStyle = makeStyle(gStyle.fill);
gPos[2] = currentFillStyle;
};
item = gStyle.space;
if (xt(item) && item !== currentSpace) currentSpace = item * scale
item = gStyle.highlight;
if (xt(item) && item !== highlightFlag) {
highlightFlag = item;
gPos[3] = highlightFlag;
};
item = gStyle.underline;
if (xt(item) && item !== underlineFlag) {
underlineFlag = item;
gPos[4] = underlineFlag;
};
item = gStyle.overline;
if (xt(item) && item !== overlineFlag) {
overlineFlag = item;
gPos[5] = overlineFlag;
};
if (i !== 0 && (gStyle.variant || gStyle.weight || gStyle.style || gStyle.stretch || gStyle.size || gStyle.sizeValue || gStyle.sizeMetric || gStyle.family || gStyle.font)) {
item = glyphAttributes.update(scale, gStyle);
if (item !== currentFont) {
currentFont = item;
gPos[0] = currentFont;
if (fontArray.indexOf(currentFont) < 0) fontArray.push(currentFont);
}
}
}
textGlyphWidths[i] = currentSpace;
}
for (i = 0, iz = textGlyphs.length; i < iz; i++) {
if (xt(textGlyphWidths[i])) currentSpace = textGlyphWidths[i];
textGlyphWidths[i] = currentSpace;
}
fontArray.forEach(font => {
fontHeightCalculator.style.font = font;
item = fontHeightCalculator.clientHeight;
fontLibrary[font] = item;
});
maxHeight = Math.max(...Object.values(fontLibrary));
totalLen = lineLen = starts = ends = 0;
for (i = 0, iz = textPositions.length; i < iz; i++) {
glyphArr = textPositions[i];
glyph = glyphArr[6];
if (glyphArr[0]) engine.font = glyphArr[0];
singles.push(engine.measureText(glyph).width);
nextGlyph = textPositions[i + 1];
nextGlyph = (!treatWordAsGlyph && nextGlyph) ? nextGlyph[6] : false;
len = (nextGlyph) ? engine.measureText(`${glyph}${nextGlyph}`).width : false;
pairs.push(len);
}
for (i = 0, iz = pairs.length; i < iz; i++) {
glyph = pairs[i];
if (glyph) {
len = singles[i] + singles[i + 1];
gPos = textPositions[i + 1];
if (len > glyph && !gPos[0]) singles[i] -= (len - glyph);
}
}
for (i = 0, iz = textPositions.length; i < iz; i++) {
glyphArr = textPositions[i];
glyph = glyphArr[6];
glyphWidth = singles[i] + textGlyphWidths[i];
textGlyphWidths[i] = glyphWidth;
if (treatWordAsGlyph || glyph === ' ') ends = i;
lineLen += glyphWidth;
totalLen += glyphWidth;
if (lineLen >= width && starts < ends) {
fragment = textGlyphs.slice(starts, ends).join('');
textLines.push(fragment);
len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
textLineWords.push(len);
len = textGlyphWidths.slice(starts, ends).reduce((a, v) => a + v, 0);
textLineWidths.push(len);
lineLen -= len;
starts = ends + 1;
}
if (i + 1 === iz) {
if (lineLen === totalLen) {
fragment = this.text;
textLines.push(fragment);
textLineWords.push((treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length);
textLineWidths.push(totalLen);
}
else {
fragment = textGlyphs.slice(starts).join('');
textLines.push(fragment);
len = (treatWordAsGlyph) ? fragment.split(' ').length - 1 : fragment.split(' ').length;
textLineWords.push(len);
len = textGlyphWidths.slice(starts).reduce((a, v) => a + v, 0);
textLineWidths.push(len);
}
}
if (xt(glyphArr[3])) highlightFlag = glyphArr[3];
if (xt(glyphArr[4])) underlineFlag = glyphArr[4];
if (xt(glyphArr[5])) overlineFlag = glyphArr[5];
glyphArr[3] = highlightFlag;
glyphArr[4] = underlineFlag;
glyphArr[5] = overlineFlag;
}
if (!path) {
if (scale <= 0) scale = 1;
dims[1] = ((maxHeight * textLines.length * lineHeight) - (maxHeight / 2)) / scale;
this.cleanHandle();
this.dirtyHandle = false;
handle = this.currentHandle;
handleX = -handle[0] * scale;
handleY = -handle[1] * scale;
if (justify === 'full') {
cursor = 0;
height = handleY + (maxHeight / 2);
for (i = 0, iz = textLineWidths.length; i < iz; i++) {
len = handleX;
if (textLineWords[i] > 1) space = (width - textLineWidths[i]) / (textLineWords[i] - 1);
else space = 0;
for (j = 0, jz = textLines[i].length; j < jz; j++) {
item = textPositions[cursor];
if (item[6] === ' ') textGlyphWidths[cursor] += space;
item[7] = len;
item[8] = height;
item[9] = textGlyphWidths[cursor];
len += textGlyphWidths[cursor];
cursor++;
}
cursor++;
height += (maxHeight * lineHeight);
}
}
else {
cursor = 0;
height = handleY + (maxHeight / 2);
for (i = 0, iz = textLineWidths.length; i < iz; i++) {
if (justify === 'right') len = (width - textLineWidths[i]) + handleX;
else if (justify === 'center') len = ((width - textLineWidths[i]) / 2) + handleX;
else len = handleX;
for (j = 0, jz = textLines[i].length; j < jz; j++) {
item = textPositions[cursor];
item[7] = len;
item[8] = height;
item[9] = textGlyphWidths[cursor];
len += textGlyphWidths[cursor];
cursor++;
}
cursor++;
height += (maxHeight * lineHeight);
}
}
}
this.textGlyphs = textGlyphs;
this.textGlyphWidths = textGlyphWidths;
this.textLines = textLines;
this.textLineWidths = textLineWidths;
this.textLineWords = textLineWords;
this.textPositions = textPositions;
this.textHeight = maxHeight;
this.textLength = totalLen;
this.fontLibrary = fontLibrary;
releaseCell(myCell);
};
P.regularStampSynchronousActions = function () {
let dest = this.currentHost,
method = this.method,
engine, i, iz, pos, data,
preStamper = this.preStamper,
stamper = this.stamper;
if (dest) {
engine = dest.engine;
if (!this.noCanvasEngineUpdates) dest.setEngine(this);
if (this.method === 'none') {
this.performRotation(engine);
}
else if (this.textPath) {
this.getTextPath();
this.calculateGlyphPathPositions();
pos = this.textPositions;
let item, pathData,
addTextPathRoll = this.addTextPathRoll,
aPR = this.addPathRotation,
cr = this.currentRotation;
this.addPathRotation = addTextPathRoll;
for (i = 0, iz = pos.length; i < iz; i++) {
item = pos[i];
pathData = item[10];
if (pathData) {
this.currentPathData = pathData;
if (addTextPathRoll) this.currentRotation = pathData.angle;
dest.rotateDestination(engine, pathData.x, pathData.y, this);
data = preStamper(engine, this, item);
stamper[method](engine, this, data);
}
}
this.addPathRotation = aPR;
this.currentRotation = cr;
}
else {
pos = this.textPositions;
this.performRotation(engine);
for (i = 0, iz = pos.length; i < iz; i++) {
data = preStamper(engine, this, pos[i]);
stamper[method](engine, this, data);
}
if (this.showBoundingBox) this.drawBoundingBox(engine);
}
}
};
P.calculateGlyphPathPositions = function () {
let path = this.getTextPath(),
len = path.length,
textPos = this.textPositions,
widths = this.textGlyphWidths,
direction = (this.textPathDirection === 'ltr') ? true : false,
pathPos = this.textPathPosition,
distance, posArray, i, iz, width,
justify = this.justify,
loop = this.textPathLoop;
for (i = 0, iz = textPos.length; i < iz; i++) {
posArray = textPos[i];
width = widths[i];
if (justify === 'right') posArray[7] = -width;
else if (justify === 'center') posArray[7] = -width / 2;
posArray[10] = (pathPos <= 1 && pathPos >= 0) ? path.getPathPositionData(pathPos) : false;
posArray[9] = width;
if (direction) pathPos += (width / len);
else pathPos -= (width / len);
if (loop && (pathPos > 1 || pathPos < 0)) {
pathPos = (pathPos > 0.5) ? pathPos - 1 : pathPos + 1;
}
}
};
P.preStamper = function (engine, entity, args) {
let [font, strokeStyle, fillStyle, highlight, underline, overline, ...data] = args;
if (font) engine.font = font;
if (highlight || underline || overline) {
let highlightStyle = entity.highlightStyle,
height = entity.textHeight,
halfHeight = height / 2,
underlineStyle = entity.underlineStyle,
underlinePosition = entity.underlinePosition,
overlineStyle = entity.overlineStyle,
overlinePosition = entity.overlinePosition;
engine.save();
if (highlight) {
engine.fillStyle = highlightStyle;
engine.fillRect(data[1], data[2] - halfHeight, data[3], height);
}
if (underline) {
engine.strokeStyle = underlineStyle;
engine.strokeRect(data[1], data[2] - halfHeight + (height * underlinePosition), data[3], 1);
}
if (overline) {
engine.strokeStyle = overlineStyle;
engine.strokeRect(data[1], data[2] - halfHeight + (height * overlinePosition), data[3], 1);
}
engine.restore();
}
if (strokeStyle) engine.strokeStyle = strokeStyle;
if (fillStyle) engine.fillStyle = fillStyle;
return data;
};
P.stamper = {
draw: function (engine, entity, data) {
engine.strokeText(...data);
},
fill: function (engine, entity, data) {
engine.fillText(...data);
},
drawAndFill: function (engine, entity, data) {
engine.strokeText(...data);
entity.currentHost.clearShadow();
engine.fillText(...data);
entity.currentHost.restoreShadow(entity);
},
fillAndDraw: function (engine, entity, data) {
engine.strokeText(...data);
entity.currentHost.clearShadow();
engine.fillText(...data);
engine.strokeText(...data);
entity.currentHost.restoreShadow(entity);
},
drawThenFill: function (engine, entity, data) {
engine.strokeText(...data);
engine.fillText(...data);
},
fillThenDraw: function (engine, entity, data) {
engine.fillText(...data);
engine.strokeText(...data);
},
clear: function (engine, entity, data) {
let gco = engine.globalCompositeOperation;
engine.globalCompositeOperation = 'destination-out';
engine.fillText(...data);
engine.globalCompositeOperation = gco;
},
};
P.drawBoundingBox = function (engine) {
engine.save();
engine.strokeStyle = this.boundingBoxColor;
engine.lineWidth = 1;
engine.globalCompositeOperation = 'source-over';
engine.globalAlpha = 1;
engine.shadowOffsetX = 0;
engine.shadowOffsetY = 0;
engine.shadowBlur = 0;
engine.stroke(this.pathObject);
engine.restore();
};
P.performRotation = function (engine) {
let dest = this.currentHost;
if (dest) {
let stamp = this.currentStampPosition;
dest.rotateDestination(engine, stamp[0], stamp[1], this);
}
};
const makePhrase = function (items) {
return new Phrase(items);
};
constructors.Phrase = Phrase;
export {
makePhrase,
};
