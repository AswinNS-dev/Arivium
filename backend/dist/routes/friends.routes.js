"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const friends_controller_1 = __importDefault(require("../controllers/friends.controller"));
const router = express_1.default.Router();
// All friend routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.post('/request', friends_controller_1.default.sendRequest);
router.post('/accept/:requestId', friends_controller_1.default.acceptRequest);
router.post('/reject/:requestId', friends_controller_1.default.rejectRequest);
router.delete('/:friendId', friends_controller_1.default.removeFriend);
router.get('/connections', friends_controller_1.default.getConnections);
router.get('/pending', friends_controller_1.default.getPending);
router.get('/sent', friends_controller_1.default.getSent);
router.get('/status/:userId', friends_controller_1.default.getStatus);
exports.default = router;
