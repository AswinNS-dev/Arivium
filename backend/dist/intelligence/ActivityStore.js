"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ActivityStore {
    constructor() {
        this.dataDir = path_1.default.resolve(__dirname, '../../.data');
        this.dataFile = path_1.default.join(this.dataDir, 'learning-profiles.json');
    }
    readAll() {
        if (!fs_1.default.existsSync(this.dataFile))
            return {};
        try {
            return JSON.parse(fs_1.default.readFileSync(this.dataFile, 'utf8'));
        }
        catch {
            return {};
        }
    }
    writeAll(profiles) {
        fs_1.default.mkdirSync(this.dataDir, { recursive: true });
        const temporary = `${this.dataFile}.tmp`;
        fs_1.default.writeFileSync(temporary, JSON.stringify(profiles, null, 2), 'utf8');
        fs_1.default.renameSync(temporary, this.dataFile);
    }
    get(profileId) {
        return this.readAll()[profileId] || null;
    }
    save(profile) {
        const profiles = this.readAll();
        profiles[profile.id] = profile;
        this.writeAll(profiles);
        return profile;
    }
    list() {
        return Object.values(this.readAll());
    }
}
exports.default = new ActivityStore();
