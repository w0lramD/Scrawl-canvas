import { radian, constructors } from '../core/library.js';
import { isa_quaternion, isa_vector, isa_number, xt, xto } from '../core/utilities.js';
import { requestVector, releaseVector, makeVector } from './vector.js';
const Quaternion = function (items = {}) {
this.name = items.name || 'generic';
this.n = items.n || 1;
this.v = makeVector();
this.set(items);
return this;
};
let P = Quaternion.prototype = Object.create(Object.prototype);
P.type = 'Quaternion';
P.set = function (items = {}) {
if (isa_quaternion(items)) return this.setFromQuaternion(items);
if (isa_vector(items)) return this.setFromVector(items);
if (xto(items.pitch, items.yaw, items.roll)) return this.setFromEuler(items);
let x, y, z, n, v,
tv = this.v;
v = (xt(items.vector) || xt(items.v)) ? (items.vector || items.v) : false;
n = (xt(items.scalar) || xt(items.n)) ? (items.scalar || items.n || 0) : false;
x = (v) ? (v.x || 0) : items.x || false;
y = (v) ? (v.y || 0) : items.y || false;
z = (v) ? (v.z || 0) : items.z || false;
this.n = (isa_number(n)) ? n : this.n;
tv.x = (isa_number(x)) ? x : tv.x;
tv.y = (isa_number(y)) ? y : tv.y;
tv.z = (isa_number(z)) ? z : tv.z;
return this;
};
P.setFromQuaternion = function (item) {
if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - setFromQuaternion() bad argument: ${item}`);
let tv = this.v,
iv = item.v;
this.n = item.n;
tv.x = iv.x;
tv.y = iv.y;
tv.z = iv.z;
return this;
};
P.setFromEuler = function (items = {}) {
let pitch, yaw, roll, c1, c2, c3, s1, s2, s3,
cos = Math.cos,
sin = Math.sin,
tv = this.v;
pitch = (items.pitch || items.x || 0) * radian;
yaw = (items.yaw || items.y || 0) * radian;
roll = (items.roll || items.z || 0) * radian;
c1 = cos( pitch / 2 );
c2 = cos( yaw / 2 );
c3 = cos( roll / 2 );
s1 = sin( pitch / 2 );
s2 = sin( yaw / 2 );
s3 = sin( roll / 2 );
tv.x = s1 * c2 * c3 + c1 * s2 * s3;
tv.y = c1 * s2 * c3 + s1 * c2 * s3;
tv.z = c1 * c2 * s3 - s1 * s2 * c3;
this.n = c1 * c2 * c3 - s1 * s2 * s3;
return this;
};
P.zero = function () {
let v = this.v;
this.n = 1;
v.x = 0;
v.y = 0;
v.z = 0;
return this;
};
P.getMagnitude = function () {
let v = this.v;
return Math.sqrt((this.n * this.n) + (v.x * v.x) + (v.y * v.y) + (v.z * v.z));
};
P.normalize = function () {
let mag = this.getMagnitude(),
v = this.v;
if (!mag) throw new Error(`${this.name} Quaternion error - normalize() division by zero: ${mag}`);
this.n /= mag;
this.n = (this.n > -0.000001 && this.n < 0.000001) ? 0 : this.n;
v.x /= mag;
v.x = (v.x > -0.000001 && v.x < 0.000001) ? 0 : v.x;
v.y /= mag;
v.y = (v.y > -0.000001 && v.y < 0.000001) ? 0 : v.y;
v.z /= mag;
v.z = (v.z > -0.000001 && v.z < 0.000001) ? 0 : v.z;
return this;
};
P.quaternionMultiply = function (item) {
if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionMultiply() bad argument: ${item}`);
let tv = this.v,
iv = item.v,
n1 = this.n,
x1 = tv.x,
y1 = tv.y,
z1 = tv.z,
n2 = item.n,
x2 = iv.x,
y2 = iv.y,
z2 = iv.z;
this.n = (n1 * n2) - (x1 * x2) - (y1 * y2) - (z1 * z2);
tv.x = (n1 * x2) + (x1 * n2) + (y1 * z2) - (z1 * y2);
tv.y = (n1 * y2) + (y1 * n2) + (z1 * x2) - (x1 * z2);
tv.z = (n1 * z2) + (z1 * n2) + (x1 * y2) - (y1 * x2);
return this;
};
P.getAngle = function (degree) {
let result;
degree = (xt(degree)) ? degree : false;
result = 2 * Math.acos(this.n);
if(degree){
result *= (1 / radian);
}
return (result > -0.000001 && result < 0.000001) ? 0 : result;
};
P.quaternionRotate = function (item) {
if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionRotate() bad argument: ${item}`);
let q4 = requestQuaternion(item),
q5 = requestQuaternion(this);
this.setFromQuaternion(q4.quaternionMultiply(q5));
releaseQuaternion(q4);
releaseQuaternion(q5);
return this
};
const quaternionPool = [];
const requestQuaternion = function (items) {
if (!quaternionPool.length) {
quaternionPool.push(makeQuaternion({
name: 'pool'
}));
}
let q = quaternionPool.shift();
q.set(items);
return q
};
const releaseQuaternion = function (q) {
if (q && q.type === 'Quaternion') {
quaternionPool.push(q.zero());
}
};
const makeQuaternion = function (items = {}) {
let q = new Quaternion(items);
return q;
};
constructors.Quaternion = Quaternion;
export {
makeQuaternion,
requestQuaternion,
releaseQuaternion,
};
