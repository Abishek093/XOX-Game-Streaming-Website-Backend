"use strict";
// import mongoose from 'mongoose'
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
// const connectDB = async ()=>{
//     try {
//         const mongoUri = process.env.MONGO_URI;
//         if (!mongoUri) {
//             throw new Error('MONGO_URI is not defined in the environment variables');
//         }
//         await mongoose.connect(mongoUri, {
//             useNewUrlParser:true,
//             useUnifiedTopology: true,
//         }as mongoose.ConnectOptions)
//         console.log("MongoDB connected")
//     } catch (error) {
//         console.error(error);
//         process.exit(1);
//     }
// }
// export default connectDB
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        yield mongoose_1.default.connect(mongoUri, {});
        console.log("MongoDB connected");
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
exports.default = connectDB;