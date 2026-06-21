"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCareerServices = initCareerServices;
const AssetLoader_1 = __importDefault(require("../ai/AssetLoader"));
async function initCareerServices() {
    await AssetLoader_1.default.initialize();
}
exports.default = {
    initCareerServices,
};
