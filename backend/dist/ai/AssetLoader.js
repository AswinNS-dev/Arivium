"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoader = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ROOT = path_1.default.resolve(__dirname, '../../../');
class AssetLoader {
    constructor() {
        this.assets = null;
    }
    static getInstance() {
        if (!AssetLoader.instance)
            AssetLoader.instance = new AssetLoader();
        return AssetLoader.instance;
    }
    async initialize() {
        if (this.assets)
            return this.assets;
        const py = path_1.default.join(ROOT, 'backend', 'python', 'asset_loader.py');
        if (!fs_1.default.existsSync(py))
            throw new Error('Python asset loader not found: ' + py);
        const res = (0, child_process_1.spawnSync)('python', [py, ROOT], { encoding: 'utf8' });
        if (res.error)
            throw res.error;
        if (res.status !== 0)
            throw new Error(res.stderr || 'asset_loader failed');
        try {
            const parsed = JSON.parse(res.stdout);
            this.assets = parsed;
            return this.assets;
        }
        catch (err) {
            throw new Error('Failed to parse asset loader output: ' + err);
        }
    }
}
exports.AssetLoader = AssetLoader;
exports.default = AssetLoader.getInstance();
