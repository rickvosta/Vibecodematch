"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const schema_1 = require("@colyseus/schema");
const BoardState_1 = require("./BoardState");
const PlayerState_1 = require("./PlayerState");
const shared_1 = require("@vibecode/shared");
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.currentLevel = 1;
        this.score = 0;
        this.movesRemaining = 0;
        this.levelStatus = shared_1.LevelStatus.Playing;
        this.board = new BoardState_1.BoardState();
        this.players = new schema_1.MapSchema();
    }
}
exports.GameState = GameState;
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "currentLevel", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "score", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], GameState.prototype, "movesRemaining", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], GameState.prototype, "levelStatus", void 0);
__decorate([
    (0, schema_1.type)(BoardState_1.BoardState),
    __metadata("design:type", Object)
], GameState.prototype, "board", void 0);
__decorate([
    (0, schema_1.type)({ map: PlayerState_1.PlayerState }),
    __metadata("design:type", Object)
], GameState.prototype, "players", void 0);
