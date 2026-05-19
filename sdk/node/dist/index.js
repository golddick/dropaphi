"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dropaphi = void 0;
const emails_1 = require("./resources/emails");
const newsletter_1 = require("./resources/newsletter");
const otp_1 = require("./resources/otp");
const files_1 = require("./resources/files");
class Dropaphi {
    constructor(apiKey, baseUrl = 'https://dropaphi.xyz/api/v1') {
        const config = { apiKey, baseUrl };
        this.emails = new emails_1.Emails(config);
        this.newsletter = new newsletter_1.Newsletter(config);
        this.otp = new otp_1.Otp(config);
        this.files = new files_1.Files(config);
    }
}
exports.Dropaphi = Dropaphi;
__exportStar(require("./types"), exports);
