"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.id = (_a = props.id) !== null && _a !== void 0 ? _a : '';
        this.email = props.email;
        this.username = props.username;
        this.displayName = props.displayName;
        this.password = props.password;
        this.profileImage = (_b = props.profileImage) !== null && _b !== void 0 ? _b : '';
        this.titleImage = props.titleImage;
        this.bio = props.bio;
        // this.followers = props.followers ?? [];
        // this.following = props.following ?? [];
        this.walletBalance = (_c = props.walletBalance) !== null && _c !== void 0 ? _c : 0;
        this.transactions = (_d = props.transactions) !== null && _d !== void 0 ? _d : [];
        this.createdAt = (_e = props.createdAt) !== null && _e !== void 0 ? _e : new Date();
        this.updatedAt = (_f = props.updatedAt) !== null && _f !== void 0 ? _f : new Date();
        this.isVerified = (_g = props.isVerified) !== null && _g !== void 0 ? _g : false;
        this.isGoogleUser = (_h = props.isGoogleUser) !== null && _h !== void 0 ? _h : false;
        this.dateOfBirth = props.dateOfBirth;
        this.isBlocked = (_j = props.isBlocked) !== null && _j !== void 0 ? _j : false;
    }
}
exports.User = User;
