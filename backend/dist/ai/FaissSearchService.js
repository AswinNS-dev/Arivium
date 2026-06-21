"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaissSearchService = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const AssetLoader_1 = __importDefault(require("./AssetLoader"));
class FaissSearchService {
    constructor() {
        this.root = path_1.default.resolve(__dirname, '../../../');
    }
    search(query, topk = 5) {
        const assets = AssetLoader_1.default.assets;
        if (!assets)
            throw new Error('Assets not initialized');
        const py = path_1.default.join(this.root, 'backend', 'python', 'faiss_search.py');
        const args = [py, assets.faissIndexPath, assets.embeddingsPath, query, String(topk), assets.rolesPath];
        const res = (0, child_process_1.spawnSync)('python', args, { encoding: 'utf8' });
        if (res.error)
            throw res.error;
        if (res.status !== 0)
            throw new Error(res.stderr || 'faiss_search failed');
        try {
            return JSON.parse(res.stdout);
        }
        catch (err) {
            throw new Error('Failed to parse faiss_search output: ' + err);
        }
    }
}
exports.FaissSearchService = FaissSearchService;
exports.default = new FaissSearchService();
