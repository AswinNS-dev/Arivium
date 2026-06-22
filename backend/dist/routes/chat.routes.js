"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const router = express_1.default.Router();
// All chat routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/conversations', chat_controller_1.default.getConversations);
router.get('/messages/:friendId', chat_controller_1.default.getMessages);
router.post('/messages/:friendId', chat_controller_1.default.sendMessage);
router.post('/messages/:friendId/read', chat_controller_1.default.markAsRead);
exports.default = router;
