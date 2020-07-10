"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/**
 * @author MatthieuCoder
 * @description A simple package for receiving events from the discord gateway.
 * @version 1.0
 **/
var Flags_1 = __importDefault(require("./utils/Flags"));
var Client_1 = __importDefault(require("./Client"));
exports["default"] = {
    version: '1.0',
    commit: '',
    FlagManager: Flags_1["default"],
    Client: Client_1["default"]
};
