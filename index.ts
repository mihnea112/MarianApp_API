import { db } from "./db";

import bodyParser, { json } from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

import express, { Express, Response, Request } from "express";
import { RowDataPacket } from "mysql2";
import e from "cors";
import { execArgv } from "process";
import { log } from "console";
const app = express();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

app.get("/ampulamare", (req, res) => {
  res.status(201).json({ answ: "femeile moare" });
});

app.post("/register", async (req, res) => {
  const bcrypt = require("bcrypt");
  const salts = parseInt(process.env.saltRounds || "");
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const adresa = req.body.adresa;
  const telefon = req.body.telefon;
  let sql = ` SELECT * FROM users WHERE email = "${email}"`;
  const [resu] = await db.execute(sql);
  const passwordHash = await bcrypt.hash(password, salts);
  console.log(await passwordHash);

  if (!(resu as any).length) {
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
    const result = (await db.execute(sql2))[0];
    const warn = (result as any).waringStatus;
    const { insertId } = result as any;
    if (warn) {
      console.log(result);
      res.status(403).send();
    } else {
      const token = jwt.sign(
        { id: insertId, email, role: 0 },
        process.env.TOKEN_KEY as string,
        {
          expiresIn: "2d",
        }
      );
      res.status(201).json({ token: token });
    }
  } else {
    res
      .status(409)
      .json({
        err: "A user with this email adress already exists. Try loging in.",
      });
  }
});
app.post("/login", async (req, res) => {
  const bcrypt = require("bcrypt");
  const salts = parseInt(process.env.saltRounds || "");
  const email = req.body.email;
  const password = req.body.password;
  let sql = ` SELECT * FROM users WHERE email = "${email}"`;
  const resu = (await db.execute(sql))[0];

  if ((resu as any).length) {
    const [user] = resu as any;
    console.log(user.password);
    console.log(password);

    const match = await bcrypt.compare(password, user.password);

    if (match == true) {
      const token = jwt.sign(
        { id: user.id, email, role: user.role },
        process.env.TOKEN_KEY as string,
        {
          expiresIn: "2d",
        }
      );
      res.status(201).json({ token: token, role: user.role });
    } else {
      res.status(410).json({ err: "password is incorrect" });
    }
  } else {
    res.status(409).json({ err: "There is no user with this email adress." });
  }
});

app.get("/user", (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res
      .status(403)
      .json({ err: "A token is required for authentication" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as object;
  if (token != null)
    return res
      .status(201)
      .json({ role: (decoded as any).role, email: (decoded as any).email });
  else return res.status(403);
});
app.get("/userdata", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res
      .status(403)
      .json({ err: "A token is required for authentication" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as object;
  let sql = ` SELECT name, email, adresa, telefon FROM users WHERE id = "${
    (decoded as any).id
  }"`;
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});

app.post("/car", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = ` SELECT * FROM cars WHERE userId = "${decoded.id}"`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});
app.post("/carm", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `SELECT * FROM cars`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});
app.post("/car/add", async (req, res) => {
  const token = req.body.token || req.query.token;
  const nPlate = req.body.nPlate;
  const VIN = req.body.VIN;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql2 = `INSERT INTO cars (
        nPlate, VIN, userId
   ) 
   VALUES (
    '${nPlate}',
    '${VIN}',
    '${decoded.id}'
    );`;
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  const { insertId } = result as any;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.get("/car/:id", async (req, res) => {
  const id = req.params.id;
  let sql = ` SELECT * FROM cars WHERE id = "${id}"`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  res.status(201).json(resu as any);
});

app.post("/jobm", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  const role = decoded.id;
  if (role != "0") {
    let sql = `SELECT * FROM jobs`;
    db.execute(sql);
    const resu = (await db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu as any);
  } else {
    return res
      .status(403)
      .json({ err: "A valid user is required for display" });
  }
});
app.post("/jobs/add", async (req, res) => {
  const token = req.body.token || req.query.token;
  const carId = req.body.carId;
  const tasks = req.body.tasks;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const now = new Date().toISOString().split("T")[0];
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
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
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  const { insertId } = result as any;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.get("/job/:id", async (req, res) => {
  const id = req.params.id;
  let sql = ` SELECT * FROM jobs WHERE carId = "${id}"`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});
app.post("/job/mecanic", async (req, res) => {
  const id = req.body.id;
  const mecid = req.body.mecid;
  console.log("mecanic:" + mecid);

  let sql = ` UPDATE jobs SET mecanicId = "${mecid}" WHERE (id = "${id}");`;
  const result = (await db.execute(sql))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.get("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  let sql = ` SELECT * FROM jobs WHERE id = "${id}"`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});
app.get("/inspect/:id", async (req, res) => {
  const id = req.params.id;
  let sql = ` SELECT * FROM inspections WHERE car_id = "${id}"`;
  db.execute(sql);
  const resu = (await db.execute(sql))[0];
  console.log(resu);
  res.status(201).json(resu as any);
});
app.post("/inspection", async (req, res) => {
  const token = req.body.token || req.query.token;
  const id = req.body.id;
  const val = req.body.val;
  console.log(id + " " + val);
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql2 = `UPDATE inspections SET val = "${val}" WHERE (id = "${id}");`;
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.post("/status", async (req, res) => {
  const token = req.body.token || req.query.token;
  const id = req.body.id;
  const status = req.body.status;
  console.log(id + " " + status);
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql2 = `UPDATE jobs SET status = "${status}" WHERE (id = "${id}");`;
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    let sql = ` SELECT * FROM jobs WHERE id = "${id}"`;
    db.execute(sql);
    const resu = (await db.execute(sql))[0];
    console.log(resu);
    res.status(201).json(resu as any);
  }
});
app.post("/cars/jobs", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `SELECT * FROM cars;`;
  const [cars] = (await db.execute(sql)) as Array<RowDataPacket>;
  const carswjobs = cars.map(async (car: { nPlate: number; id: number }) => {
    let sql = `SELECT *  FROM jobs WHERE carId=${car.id};`;
    const [jobs] = (await db.execute(sql)) as Array<RowDataPacket>;
    const jobswmec = jobs.map(async (job: { mecanicId: number }) => {
      if (job.mecanicId != 0) {
        let sql2 = `Select * from users where id=${job.mecanicId};`;
        const [user] = ((await db.execute(sql2)) as RowDataPacket[][])[0];
        return { ...job, mecanic: user };
      } else return { ...job, mecanic: null };
    });
    return Promise.all(jobswmec).then((result) => {
      return { ...car, jobs: result };
    });
  });
  Promise.all(carswjobs).then((results) => {
    console.log(results);
    res.status(201).json(results);
  });
});
app.post("/mecanic/car", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let userId = decoded.id;
  console.log(userId);
  let sql = `SELECT * FROM cars;`;
  const [cars] = (await db.execute(sql)) as Array<RowDataPacket>;

  const carswemail = cars.map(
    async (car: {
      id: number;
      VIN: string;
      nPlate: string;
      userId: number;
    }) => {
      let sql = `SELECT * FROM jobs WHERE carId=${car.id} AND mecanicId=${userId} AND status!="Done"`;
      const [jobs] = (await db.execute(sql)) as Array<RowDataPacket>;
      return { ...car, jobs: jobs };
    }
  );

  console.log(carswemail);

  Promise.all(carswemail).then((results) => {
    res.status(201).json(results.filter((car) => car.jobs.length > 0));
  });
});
app.post("/cara", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;

  let sql = `SELECT * FROM cars;`;
  const [cars] = (await db.execute(sql)) as Array<RowDataPacket>;

  const carswemail = cars.map(
    async (car: {
      id: number;
      VIN: string;
      nPlate: string;
      userId: number;
    }) => {
      let sql = `SELECT name FROM users WHERE id=${car.userId}`;
      const [email] = (await db.execute(sql)) as Array<RowDataPacket>;
      return { ...car, name: email[0].name };
    }
  );

  console.log(carswemail);

  Promise.all(carswemail).then((results) => {
    res.status(201).json(results);
  });
});
app.post("/checklist", async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token) {
    return res.status(403).json({ err: "A token is required for display" });
  }
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `SELECT * FROM checklist`;
  const [cars] = (await db.execute(sql)) as Array<RowDataPacket>;
  res.status(201).json(cars);
});
app.post("/checklist/edit", async (req, res) => {
  const token = req.body.token || req.query.token;
  const item = req.body.item;
  const id = req.body.id;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql2 = `UPDATE checklist SET item = "${item}" WHERE (id = "${id}");`;
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.post("/piese", async (req, res) => {
  const token = req.body.token || req.query.token;
  const piese = req.body.piese;
  const id = req.body.id;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql2 = `UPDATE jobs SET piese = "${piese}" WHERE (id = "${id}");`;
  const result = (await db.execute(sql2))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.delete("/checklist/delete/:id", async (req, res) => {
  const id = req.params.id;
  let sql2 = `Delete FROM checklist WHERE (id = "${id}");`;
  let sql = `DELETE FROM inspections WHERE item_id = "${id}"`;
  const result = (await db.execute(sql2))[0];
  const result2 = (await db.execute(sql))[0];
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    console.log(result2);
    res.status(500).send();
  } else {
    console.log(result);
    console.log(result2);
    res.status(201).send();
  }
});
app.post("/checklist/add", async (req, res) => {
  const token = req.body.token || req.query.token;
  const item = req.body.item;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `INSERT INTO checklist (
        item,maxval
   ) 
   VALUES (
    '${item}',
    '2'
    );`;
  let sql2 = `SELECT id FROM checklist WHERE item='${item}';`;
  let sql3 = `SELECT id FROM cars;`;
  const result = (await db.execute(sql))[0];
  const result2 = ((await db.execute(sql2))[0] as any)[0];
  const [cars] = (await db.execute(sql3)) as Array<RowDataPacket>;
  cars.map(async (car: any) => {
    let sqlc = `INSERT INTO inspections (
            item_name,item_id,car_id
       ) 
       VALUES (
        '${item}',
        ${(result2 as any).id},
        ${(car as any).id}
        );`;
    const resultc = (await db.execute(sqlc))[0];
    console.log(resultc);
  });
  const warn = (result as any).waringStatus;
  if (warn) {
    console.log(result);
    res.status(500).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.post("/mecanic/jobs", async (req, res) => {
  const token = req.body.token || req.query.token;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `SELECT * FROM users WHERE role="1"`;
  const [users] = (await db.execute(sql)) as Array<RowDataPacket>;
  console.log(users);
  const mecwjobs = users.map(async (user: any) => {
    let sql2 = `Select * FROM jobs WHERE mecanicId=${user.id} AND status!="Done"`;
    const [job] = (await db.execute(sql2)) as Array<RowDataPacket>;
    const jobswmec = job.map(async (job: any) => {
      let sql2 = `Select * from cars where id=${job.carId};`;
      const [car] = ((await db.execute(sql2)) as RowDataPacket[][])[0];
      return {
        id: job.id,
        tasks: job.tasks,
        date: job.date,
        status: job.status,
        car: car,
      };
    });
    return Promise.all(jobswmec).then((result) => {
      return { ...user, jobs: result };
    });
  });
  Promise.all(mecwjobs).then((results) => {
    res.status(201).json(results);
  });
});

app.post("/mecanic", async (req, res) => {
  const token = req.body.token || req.query.token;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `SELECT * FROM users WHERE role=1`;
  const [users] = (await db.execute(sql)) as Array<RowDataPacket>;
  res.status(201).json(users);
});
app.post("/mecanic/add", async (req, res) => {
  const token = req.body.token || req.query.token;
  const email = req.body.email;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `UPDATE users SET role = "1" WHERE (email = "${email}");`;
  const result = (await db.execute(sql))[0];
  const warn = (result as any).affectedRows;
  if (warn == 0) {
    console.log(result);
    res.status(403).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.post("/mecanic/delete", async (req, res) => {
  const token = req.body.token || req.query.token;
  const email = req.body.email;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `UPDATE users SET role = "0" WHERE (email = "${email}");`;
  const result = (await db.execute(sql))[0];
  const warn = (result as any).affectedRows;
  if (warn == 0) {
    console.log(result);
    res.status(403).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
app.post("/feedback", async (req, res) => {
  const token = req.body.token || req.query.token;
  const jobId = req.body.jobId;
  const content = req.body.content;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as any;
  let sql = `UPDATE jobs SET feedback = "${content}" WHERE (id = "${jobId}");`;
  const result = (await db.execute(sql))[0];
  const warn = (result as any).affectedRows;
  if (warn == 0) {
    console.log(result);
    res.status(403).send();
  } else {
    console.log(result);
    res.status(201).send();
  }
});
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server started on port " + port);
});
