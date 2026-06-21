"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiRoadmapService = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
class GeminiRoadmapService {
    constructor() {
        this.root = path_1.default.resolve(__dirname, '../../../');
    }
    generateRoadmap(context) {
        const promptPath = path_1.default.join(this.root, 'src', 'prompts', 'roadmap_prompt.txt');
        const prompt = fs_1.default.existsSync(promptPath) ? fs_1.default.readFileSync(promptPath, 'utf8') : '';
        const py = path_1.default.join(this.root, 'backend', 'python', 'roadmap.py');
        const args = [py, JSON.stringify(context), prompt];
        const res = (0, child_process_1.spawnSync)('python', args, { encoding: 'utf8' });
        if (res.error)
            throw res.error;
        if (res.status !== 0)
            throw new Error(res.stderr || 'roadmap failed');
        try {
            return JSON.parse(res.stdout);
        }
        catch (err) {
            throw new Error('Failed to parse roadmap output: ' + err);
        }
    }
}
exports.GeminiRoadmapService = GeminiRoadmapService;
exports.default = new GeminiRoadmapService();
