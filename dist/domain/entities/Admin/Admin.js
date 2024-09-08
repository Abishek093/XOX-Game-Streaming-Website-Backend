"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
class Admin {
    constructor(props) {
        var _a;
        this.id = (_a = props.id) !== null && _a !== void 0 ? _a : '';
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;
    }
}
exports.Admin = Admin;
