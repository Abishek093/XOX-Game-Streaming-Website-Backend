"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishProfileUpdateMessage = exports.publishProfileImageUpdateMessage = exports.publishUserCreationMessage = void 0;
const opossum_1 = __importDefault(require("opossum"));
const RabbitMQPublisher_1 = require("../../services/RabbitMQPublisher");
const options = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
};
const circuitBreaker = new opossum_1.default((message, queueName) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, RabbitMQPublisher_1.publishToQueue)(queueName, message);
}), options);
circuitBreaker.fallback((message, queueName) => {
    console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
});
const publishUserCreationMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    return circuitBreaker.fire(message, 'chat-service-create-user');
});
exports.publishUserCreationMessage = publishUserCreationMessage;
const publishProfileImageUpdateMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    return circuitBreaker.fire(message, 'chat-service-update-profile-image');
});
exports.publishProfileImageUpdateMessage = publishProfileImageUpdateMessage;
const publishProfileUpdateMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    return circuitBreaker.fire(message, 'chat-service-update-profile');
});
exports.publishProfileUpdateMessage = publishProfileUpdateMessage;
