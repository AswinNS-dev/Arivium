"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const career_routes_1 = __importDefault(require("./routes/career.routes"));
const intelligence_routes_1 = __importDefault(require("./routes/intelligence.routes"));
const career_service_1 = __importDefault(require("./services/career.service"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
app.use('/api/v1/career', career_routes_1.default);
app.use('/api/v1/intelligence', intelligence_routes_1.default);
const PORT = process.env.PORT || 4000;
async function start() {
    try {
        await career_service_1.default.initCareerServices();
        app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}
start();
