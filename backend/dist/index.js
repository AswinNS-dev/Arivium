"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const career_routes_1 = __importDefault(require("./routes/career.routes"));
const intelligence_routes_1 = __importDefault(require("./routes/intelligence.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const friends_routes_1 = __importDefault(require("./routes/friends.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const career_service_1 = __importDefault(require("./services/career.service"));
const chat_gateway_1 = require("./gateways/chat.gateway");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/career', career_routes_1.default);
app.use('/api/v1/intelligence', intelligence_routes_1.default);
app.use('/api/v1/users', users_routes_1.default);
app.use('/api/v1/friends', friends_routes_1.default);
app.use('/api/v1/chat', chat_routes_1.default);
// Initialize Socket.IO for real-time chat
const io = (0, chat_gateway_1.initializeChatGateway)(httpServer);
const PORT = process.env.PORT || 4000;
async function start() {
    try {
        await career_service_1.default.initCareerServices();
        httpServer.listen(PORT, () => console.log(`Server listening on ${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}
start();
