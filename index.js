const express = require("express");
const cors = require("cors");
const path = require("path");

const bodyParser = require("body-parser");
const app = express();
// var port = 3030

app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.static("public"));

const port = process.env.PORT || 3333;

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});

const sqlite3 = require("sqlite3").verbose();

// console.log(sqlite3);
// console.log("Connecting...");

//Initial connect to db
let db = new sqlite3.Database(
  "./settings.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    //if db doesnt exist...
    if (err && err.code == "SQLITE_CANTOPEN") {
      //create db
      createDatabase();
      return;
    } else if (err) {
      console.log("Getting error " + err);
      //exit(1);
    }
    console.log("Connected to the in-memory SQlite database.");
  }
);

function createDatabase() {
  //Create db only if doesnt exist...
  var newdb = new sqlite3.Database("./settings.db", (err) => {
    if (err) {
      console.log("Getting error " + err);
      //   exit(1);
    }
    newdb.exec(
      `CREATE TABLE activities (id integer primary key, fr text, en text);
	  CREATE TABLE entreprises (id integer primary key, name text, link text, activity integer not null, FOREIGN KEY(activity) REFERENCES activities(id));
		INSERT INTO activities (fr, en) VALUES('parapente', 'parapenteEN');
		INSERT INTO activities (fr, en) VALUES('deltaplane', 'deltaplaneEN');
		INSERT INTO activities (fr, en) VALUES('motoneige', 'motoneigeEN');
		INSERT INTO activities (fr, en) VALUES('VTT', 'VTTEN');
		INSERT INTO entreprises (name, link, activity) VALUES('Pneus Mascouche', 'http://', 1);
		INSERT INTO entreprises (name, link, activity) VALUES('St-Hubert', 'http://ss', 1);
		INSERT INTO entreprises (name, link, activity) VALUES('Dongo Trains', 'http://www', 2);`,

      () => {
        // callback
      }
    );
  });
}

async function getDBConnection() {
  //Connect to db
  const db = new sqlite3.Database(
    "./settings.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        return console.error(err.message);
      }
    }
  );
  return db;
}

app.get("/api/:id/entreprises", async function (req, res) {
  let db = await getDBConnection();
  let authors = await db.all(
    "SELECT name, link, id from entreprises WHERE activity = " + req.params.id,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        console.log("request received...");
        console.log(data);
        res.send({ data });
      }
    }
  );
});
app.get("/admin", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/entreprises", async function (req, res) {
  let db = await getDBConnection();
  let authors = await db.all(
    "SELECT name, link, activity, id from entreprises ",
    (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send({ data });
      }
    }
  );
});
app.get("/api/activities", async function (req, res) {
  let db = await getDBConnection();
  let authors = await db.all("SELECT * from activities", (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ data });
    }
  });
});
app.get("/api/activities/:id", async function (req, res) {
  let db = await getDBConnection();
  let authors = await db.all(
    "SELECT * from activities WHERE id=" + req.params.id,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        console.log("request received...");
        console.log(data);
        res.send({ data });
      }
    }
  );
});
//If the incoming post path is /api/settings, the update all settings with provided parameters
// app.post('/api/entreprise/:id', async function (req, res) {
//   let db = await getDBConnection()

//   let authors = await db.all(
//     `UPDATE entreprises SET "${req.body.key}"="${req.body.value}" WHERE id=${req.params.id} RETURNING *`,
//     (err, settings) => {
//       if (err) {
//         console.log(err)
//         res.status(500).send(err)
//       } else {
//         res.send({ settings })
//       }
//     }
//   )
// })
app.post("/api/entreprises/", async function (req, res) {
  let db = await getDBConnection();
  let payload = req.body;

  let request = "";
  payload.forEach((e) => {
    request += "UPDATE entreprises SET ";

    for (const [key, value] of Object.entries(e)) {
      if (key != "id") request += `${key} = "${value}", `;
    }
    request = request.replace(/,\s*$/, "");
    request += ` WHERE id=${e.id} RETURNING *; `;
  });
  console.log(request);
  await db.exec(request, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});
app.post("/api/activities/:id", async function (req, res) {
  let db = await getDBConnection();
  let payload = req.body;

  let request = "";
  for (const [key, value] of Object.entries(payload)) {
    request += `${key} = "${value}", `;
  }
  request = request.replace(/,\s*$/, "");

  await db.all(
    `UPDATE activities SET ${request} WHERE id=${req.params.id} RETURNING *`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ data });
      }
    }
  );
});
app.post("/api/entreprises/:id/delete", async function (req, res) {
  let db = await getDBConnection();

  await db.all(
    `DELETE FROM entreprises WHERE id=${req.params.id}`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ data });
      }
    }
  );
});
app.post("/api/activities/:id/add", async function (req, res) {
  let db = await getDBConnection();

  await db.all(
    `INSERT INTO entreprises (activity, name, link) VALUES (${req.params.id}, '', '')`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.send({ data });
      }
    }
  );
});
module.exports = app;
