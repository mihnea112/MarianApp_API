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
const mailer_1 = require("./mailer");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("dotenv").config();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get("/ampulamare", (req, res) => {
    res.status(201).json({ answ: "femeile moare" });
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bcrypt = require("bcrypt");
    const salts = parseInt(process.env.saltRounds || "");
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const adresa = req.body.adresa;
    const telefon = req.body.telefon;
    let sql = ` SELECT * FROM users WHERE email = "${email}"`;
    const [resu] = yield db_1.db.execute(sql);
    const passwordHash = yield bcrypt.hash(password, salts);
    console.log(yield passwordHash);
    if (!resu.length) {
        let sql2 = `INSERT INTO users (
                    email, password, name, adresa, telefon
               ) 
               VALUES (
                '${email}',
                '${passwordHash}',
                '${name}',
                '${adresa}',
                '${telefon}'
                );`;
        const result = (yield db_1.db.execute(sql2))[0];
        const warn = result.waringStatus;
        const { insertId } = result;
        if (warn) {
            console.log(result);
            res.status(403).send();
        }
        else {
            const token = jsonwebtoken_1.default.sign({ id: insertId, email, role: 0 }, process.env.TOKEN_KEY, {
                expiresIn: "2d",
            });
            res.status(201).json({ token: token });
        }
    }
    else {
        res.status(409).json({
            err: "A user with this email adress already exists. Try loging in.",
        });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bcrypt = require("bcrypt");
    const salts = parseInt(process.env.saltRounds || "");
    const email = req.body.email;
    const password = req.body.password;
    let sql = ` SELECT * FROM users WHERE email = "${email}"`;
    const resu = (yield db_1.db.execute(sql))[0];
    if (resu.length) {
        const [user] = resu;
        console.log(user.password);
        console.log(password);
        const match = yield bcrypt.compare(password, user.password);
        if (match == true) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, email, role: user.role }, process.env.TOKEN_KEY, {
                expiresIn: "2d",
            });
            const to = "ayanna.mihnea@yahoo.com";
            const subject = "Test Email";
            const text = "Hello, this is a test email sent from Node.js with TypeScript!";
            yield (0, mailer_1.sendEmail)(to, subject, text);
            res.status(201).json({ token: token, role: user.role });
        }
        else {
            res.status(410).json({ err: "password is incorrect" });
        }
    }
    else {
        res.status(409).json({ err: "There is no user with this email adress." });
    }
}));
app.get("/user", (req, res) => {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res
            .status(403)
            .json({ err: "A token is required for authentication" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    if (token != null)
        return res
            .status(201)
            .json({ role: decoded.role, email: decoded.email });
    else
        return res.status(403);
});
app.get("/userdata", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res
            .status(403)
            .json({ err: "A token is required for authentication" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = ` SELECT name, email, adresa, telefon FROM users WHERE id = "${decoded.id}"`;
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.post("/car", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = ` SELECT * FROM cars WHERE userId = "${decoded.id}"`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.post("/carm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM cars`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.post("/car/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const nPlate = req.body.nPlate;
    const VIN = req.body.VIN;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `INSERT INTO cars (
        nPlate, VIN, userId
   ) 
   VALUES (
    '${nPlate}',
    '${VIN}',
    '${decoded.id}'
    );`;
    const result = (yield db_1.db.execute(sql2))[0];
    const warn = result.waringStatus;
    const { insertId } = result;
    if (warn) {
        console.log(result);
        res.status(500).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
app.get("/car/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let sql = ` SELECT * FROM cars WHERE id = "${id}"`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    res.status(201).json(resu);
}));
app.post("/jobm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    const role = decoded.id;
    if (role != "0") {
        let sql = `SELECT * FROM jobs`;
        db_1.db.execute(sql);
        const resu = (yield db_1.db.execute(sql))[0];
        console.log(resu);
        res.status(201).json(resu);
    }
    else {
        return res
            .status(403)
            .json({ err: "A valid user is required for display" });
    }
}));
app.post("/jobs/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const carId = req.body.carId;
    const tasks = req.body.tasks;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const now = new Date().toISOString().split("T")[0];
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `INSERT INTO jobs (
        carId, tasks, userId, status, date
   ) 
   VALUES (
    '${carId}',
    '${tasks}',
    '${decoded.id}',
    'waiting',
    '${now}'
    );`;
    const result = (yield db_1.db.execute(sql2))[0];
    const warn = result.waringStatus;
    const { insertId } = result;
    if (warn) {
        console.log(result);
        res.status(500).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
app.get("/job/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let sql = ` SELECT * FROM jobs WHERE carId = "${id}"`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.post("/job/mecanic", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const mecid = req.body.mecid;
    console.log("mecanic:" + mecid);
    let sql = ` UPDATE jobs SET mecanicId = "${mecid}" WHERE (id = "${id}");`;
    const result = (yield db_1.db.execute(sql))[0];
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
app.get("/jobs/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let sql = ` SELECT * FROM jobs WHERE id = "${id}"`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.get("/inspect/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let sql = ` SELECT * FROM inspections WHERE car_id = "${id}"`;
    db_1.db.execute(sql);
    const resu = (yield db_1.db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu);
}));
app.post("/inspection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const id = req.body.id;
    const val = req.body.val;
    console.log(id + " " + val);
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `UPDATE inspections SET val = "${val}" WHERE (id = "${id}");`;
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
app.post("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const id = req.body.id;
    const status = req.body.status;
    console.log(id + " " + status);
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `UPDATE jobs SET status = "${status}" WHERE (id = "${id}");`;
    const result = (yield db_1.db.execute(sql2))[0];
    const warn = result.waringStatus;
    if (warn) {
        console.log(result);
        res.status(500).send();
    }
    else {
        let sql = ` SELECT * FROM jobs WHERE id = "${id}"`;
        db_1.db.execute(sql);
        const resu = (yield db_1.db.execute(sql))[0];
        console.log(resu);
        res.status(201).json(resu);
    }
}));
app.post("/cars/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM cars;`;
    const [cars] = (yield db_1.db.execute(sql));
    const carswjobs = cars.map((car) => __awaiter(void 0, void 0, void 0, function* () {
        let sql = `SELECT *  FROM jobs WHERE carId=${car.id};`;
        const [jobs] = (yield db_1.db.execute(sql));
        const jobswmec = jobs.map((job) => __awaiter(void 0, void 0, void 0, function* () {
            if (job.mecanicId != 0) {
                let sql2 = `Select * from users where id=${job.mecanicId};`;
                const [user] = (yield db_1.db.execute(sql2))[0];
                return Object.assign(Object.assign({}, job), { mecanic: user });
            }
            else
                return Object.assign(Object.assign({}, job), { mecanic: null });
        }));
        return Promise.all(jobswmec).then((result) => {
            return Object.assign(Object.assign({}, car), { jobs: result });
        });
    }));
    Promise.all(carswjobs).then((results) => {
        console.log(results);
        res.status(201).json(results);
    });
}));
app.post("/mecanic/car", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let userId = decoded.id;
    console.log(userId);
    let sql = `SELECT * FROM cars;`;
    const [cars] = (yield db_1.db.execute(sql));
    const carswemail = cars.map((car) => __awaiter(void 0, void 0, void 0, function* () {
        let sql = `SELECT * FROM jobs WHERE carId=${car.id} AND mecanicId=${userId} AND status!="Done"`;
        const [jobs] = (yield db_1.db.execute(sql));
        return Object.assign(Object.assign({}, car), { jobs: jobs });
    }));
    console.log(carswemail);
    Promise.all(carswemail).then((results) => {
        res.status(201).json(results.filter((car) => car.jobs.length > 0));
    });
}));
app.post("/cara", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM cars;`;
    const [cars] = (yield db_1.db.execute(sql));
    const carswemail = cars.map((car) => __awaiter(void 0, void 0, void 0, function* () {
        let sql = `SELECT name FROM users WHERE id=${car.userId}`;
        const [email] = (yield db_1.db.execute(sql));
        return Object.assign(Object.assign({}, car), { name: email[0].name });
    }));
    console.log(carswemail);
    Promise.all(carswemail).then((results) => {
        res.status(201).json(results);
    });
}));
app.post("/checklist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    if (!token) {
        return res.status(403).json({ err: "A token is required for display" });
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM checklist`;
    const [cars] = (yield db_1.db.execute(sql));
    res.status(201).json(cars);
}));
app.post("/checklist/edit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.post("/piese", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const piese = req.body.piese;
    const id = req.body.id;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql2 = `UPDATE jobs SET piese = "${piese}" WHERE (id = "${id}");`;
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
app.delete("/checklist/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    let sql2 = `Delete FROM checklist WHERE (id = "${id}");`;
    let sql = `DELETE FROM inspections WHERE item_id = "${id}"`;
    const result = (yield db_1.db.execute(sql2))[0];
    const result2 = (yield db_1.db.execute(sql))[0];
    const warn = result.waringStatus;
    if (warn) {
        console.log(result);
        console.log(result2);
        res.status(500).send();
    }
    else {
        console.log(result);
        console.log(result2);
        res.status(201).send();
    }
}));
app.post("/checklist/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const item = req.body.item;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `INSERT INTO checklist (
        item,maxval
   ) 
   VALUES (
    '${item}',
    '2'
    );`;
    let sql2 = `SELECT id FROM checklist WHERE item='${item}';`;
    let sql3 = `SELECT id FROM cars;`;
    const result = (yield db_1.db.execute(sql))[0];
    const result2 = (yield db_1.db.execute(sql2))[0][0];
    const [cars] = (yield db_1.db.execute(sql3));
    cars.map((car) => __awaiter(void 0, void 0, void 0, function* () {
        let sqlc = `INSERT INTO inspections (
            item_name,item_id,car_id
       ) 
       VALUES (
        '${item}',
        ${result2.id},
        ${car.id}
        );`;
        const resultc = (yield db_1.db.execute(sqlc))[0];
        console.log(resultc);
    }));
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
app.post("/mecanic/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM users WHERE role="1"`;
    const [users] = (yield db_1.db.execute(sql));
    console.log(users);
    const mecwjobs = users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        let sql2 = `Select * FROM jobs WHERE mecanicId=${user.id} AND status!="Done"`;
        const [job] = (yield db_1.db.execute(sql2));
        const jobswmec = job.map((job) => __awaiter(void 0, void 0, void 0, function* () {
            let sql2 = `Select * from cars where id=${job.carId};`;
            const [car] = (yield db_1.db.execute(sql2))[0];
            return {
                id: job.id,
                tasks: job.tasks,
                date: job.date,
                status: job.status,
                car: car,
            };
        }));
        return Promise.all(jobswmec).then((result) => {
            return Object.assign(Object.assign({}, user), { jobs: result });
        });
    }));
    Promise.all(mecwjobs).then((results) => {
        res.status(201).json(results);
    });
}));
app.post("/mecanic", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `SELECT * FROM users WHERE role=1`;
    const [users] = (yield db_1.db.execute(sql));
    res.status(201).json(users);
}));
app.post("/mecanic/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const email = req.body.email;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `UPDATE users SET role = "1" WHERE (email = "${email}");`;
    const result = (yield db_1.db.execute(sql))[0];
    const warn = result.affectedRows;
    if (warn == 0) {
        console.log(result);
        res.status(403).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
app.post("/mecanic/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const email = req.body.email;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `UPDATE users SET role = "0" WHERE (email = "${email}");`;
    const result = (yield db_1.db.execute(sql))[0];
    const warn = result.affectedRows;
    if (warn == 0) {
        console.log(result);
        res.status(403).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
app.post("/feedback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token || req.query.token;
    const jobId = req.body.jobId;
    const content = req.body.content;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
    let sql = `UPDATE jobs SET feedback = "${content}" WHERE (id = "${jobId}");`;
    const result = (yield db_1.db.execute(sql))[0];
    const warn = result.affectedRows;
    if (warn == 0) {
        console.log(result);
        res.status(403).send();
    }
    else {
        console.log(result);
        res.status(201).send();
    }
}));
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("Server started on port " + port);
});
