import { animation, constructors } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt,
defaultNonReturnFunction, defaultPromiseReturnFunction, defaultThisReturnFunction } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';
import baseMix from '../mixin/base.js';
const Animation = function (items = {}) {
this.makeName(items.name);
this.order = (xt(items.order)) ? items.order : this.defs.order;
this.fn = items.fn || defaultPromiseReturnFunction;
this.onRun = items.onRun || defaultNonReturnFunction;
this.onHalt = items.onHalt || defaultNonReturnFunction;
this.onKill = items.onKill || defaultNonReturnFunction;
this.register();
if(!items.delay) this.run();
return this;
};
let P = Animation.prototype = Object.create(Object.prototype);
P.type = 'Animation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
order: 1,
fn: null,
onRun: null,
onHalt: null,
onKill: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.stringifyFunction = defaultNonReturnFunction;
P.processPacketOut = defaultNonReturnFunction;
P.finalizePacketOut = defaultNonReturnFunction;
P.saveAsPacket = function () {
return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = defaultThisReturnFunction;
P.run = function () {
this.onRun();
pushUnique(animate, this.name);
resortAnimations();
return this;
};
P.isRunning = function () {
return (animate.indexOf(this.name) >= 0) ? true : false;
};
P.halt = function () {
this.onHalt();
removeItem(animate, this.name);
resortAnimations();
return this;
};
P.kill = function () {
this.onKill();
removeItem(animate, this.name);
resortAnimations();
this.deregister();
return true;
};
const makeAnimation = function (items) {
return new Animation(items);
};
constructors.Animation = Animation;
export {
makeAnimation,
};
