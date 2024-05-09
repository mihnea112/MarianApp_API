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
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _1 = require(".");
_1.app.post("/checklist/edit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const item = req.body.item;
    const id = req.body.id;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `UPDATE checklist SET item = "${item}" WHERE (id = "${id}");`;
    const result = (yield db_1.db.execute(sql2))[0];
    const warn = result.waringStatus;
    if (warn) {
        console.log(result);
        res.status(500).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
