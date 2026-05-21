"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelStatus = exports.SpecialType = exports.CandyType = void 0;
var CandyType;
(function (CandyType) {
    CandyType["Red"] = "red";
    CandyType["Orange"] = "orange";
    CandyType["Yellow"] = "yellow";
    CandyType["Green"] = "green";
    CandyType["Blue"] = "blue";
    CandyType["Purple"] = "purple";
})(CandyType || (exports.CandyType = CandyType = {}));
var SpecialType;
(function (SpecialType) {
    SpecialType["None"] = "none";
    SpecialType["Striped"] = "striped";
    SpecialType["Wrapped"] = "wrapped";
    SpecialType["ColorBomb"] = "colorbomb";
})(SpecialType || (exports.SpecialType = SpecialType = {}));
var LevelStatus;
(function (LevelStatus) {
    LevelStatus["Playing"] = "playing";
    LevelStatus["Complete"] = "complete";
    LevelStatus["Failed"] = "failed";
})(LevelStatus || (exports.LevelStatus = LevelStatus = {}));
