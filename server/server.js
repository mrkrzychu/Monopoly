const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const mysql = require('mysql');
const { play } = require('glyphicons');

//create connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: "monopoly"
});

//connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('mysql connected')
});

const app = express();
app.use(bodyParser.json());
app.use(pino);

// get board
app.get('/getBoard', (req, res) => {
  let sqlBoard = 'SELECT * FROM board';
  let queryBoard = db.query(sqlBoard, (errB, fields) => {
    if (errB) throw errB;
    let sqlPlayer = 'SELECT * FROM player';
    let queryPlayer = db.query(sqlPlayer, (errP, players) => {
      if (errP) throw errP;
      let sqlCard = 'SELECT * FROM card';
      let queryCard = db.query(sqlCard, (errC, cards) => {
        if (errC) throw errC;
        let sqlState = 'SELECT currPlayer FROM state';
        let queryState = db.query(sqlState, (errS, state) => {
          if (errS) throw errS;
          for (var pl of players) {
            if (pl.lost !== 1) {
              if (typeof fields[pl.position].players == 'undefined') {
                fields[pl.position].players = [];
              }
              fields[pl.position].players.push(pl);
            }
          }
          var board = { "fields": fields, "players": players, "cards": cards, "currPlayer": state[0].currPlayer };

          res.send(board);
        });
      });
    });
  });
});


app.post('/newGame', (req, res) => {
  let sqlPlayer = 'delete FROM player';
  let queryPlayer = db.query(sqlPlayer, (errP, resultsPlayer) => {
    if (errP) throw errP;

    let sqlBoard = 'update board set owner = NULL, house = NULL, hotel = NULL';
    let queryBoard = db.query(sqlBoard, (errB, resultsBoard) => {
      if (errB) throw errB;
      let sqlState = 'update state set currPlayer = 0';
      let queryState = db.query(sqlState, (errS, resultsState) => {
        if (errS) throw errS;

        res.send({});
      });
    })
  });
});


app.post('/bancrupt', (req, res) => {
  const params = req.body;
  const player = params.player;

  let sqlPlayer = 'update player set lost = 1 where id = ' + player;
  let queryPlayer = db.query(sqlPlayer, (errP, resultsPlayer) => {
    if (errP) throw errP;

    let sqlBoard = 'update board set owner = NULL, house = NULL, hotel = NULL where owner = ' + player;
    let queryBoard = db.query(sqlBoard, (errB, resultsBoard) => {
      if (errB) throw errB;

    });
  });
});

app.post('/endturn', (req, res) => {
  const params = req.body;
  const player = params.player;

  let sqlPlayer = 'update state set currPlayer = ' + player;
  let queryPlayer = db.query(sqlPlayer, (errP, resultsPlayer) => {
    if (errP) throw errP;

    res.send({});
  });
});

app.post('/newplayer', (req, res) => {
  const params = req.body;

  let selectSql = 'select max(id) as maxid from player';
  let selectQuery = db.query(selectSql, (err, selectResult) => {
    if (err) throw err;

    var maxId = selectResult[0].maxid;
    var nextId = 0;
    if (maxId != null) {
      nextId = maxId + 1;
    }

    let sqlParams = {
      id: nextId,
      name: params.name,
      cash: 1500,
      color_player: params.color,
      position: 0,
      computer: params.computer
    };
    let sql = 'INSERT INTO player SET ?';
    let query = db.query(sql, sqlParams, (err, result) => {
      if (err) throw err;

      res.send(sqlParams);
    });
  });
});

app.post('/move', (req, res) => {
  const params = req.body;
  const player = params.player;
  const move = params.value;
  const gotoJail = params.jail;

  if (typeof player == 'undefined' || typeof move == 'undefined') {
    res.send('error');
    return;
  }

  let sqlPlayer = 'SELECT position, cash, jail FROM player WHERE id = ' + player;
  let queryPlayer = db.query(sqlPlayer, (errP, resultsPlayer) => {
    if (errP) throw errP;

    const curPosition = resultsPlayer[0].position;
    var newPosition = (curPosition + move) % 40;
    var newCash = resultsPlayer[0].cash;
    var jail = resultsPlayer[0].jail;

    if (newPosition < curPosition && !gotoJail) {
      newCash += 200;
    }

    if (newPosition === 4) {
      newCash -= 200;
    } else if (newPosition === 38) {
      newCash -= 100;
    }

    if (jail > 0) {
      jail--;
    }

    if (jail > 0 && move > 0) {
      jail = 0;
    }

    if (newPosition === 30 || gotoJail) {
      newPosition = 10;
      jail = 3;
    }


    let sql = 'UPDATE player SET position = ' + newPosition + ' ,cash = ' + newCash + ' , jail = ' + jail + ' WHERE id = ' + player;
    let query = db.query(sql, (err, result) => {
      if (err) throw err;


      let sqlField = 'select * from board where id = ' + newPosition;
      let query = db.query(sqlField, (err, fields) => {
        var field = fields[0];
        var ret = {};
        ret.old = curPosition;
        ret.new = newPosition;
        ret.cash = newCash;
        ret.jail = jail;
        if (field.owner == null && field.price != null && field.type != "TAX") {
          ret.todo = {};
          ret.todo.action = "BUY";
          ret.todo.field = field;
        } else if (field.owner != null && field.owner != player) {
          ret.todo = {};
          ret.todo.action = "PAY";
          ret.todo.field = field;
        } else if (field.owner == player && field.type == 'PROPERTY' && field.hotel === null) {
          ret.todo = {};
          ret.todo.action = "BUILD";
          ret.todo.field = field;
        } else if (field.type === 'CARD') {
          ret.todo = {};
          ret.todo.action = "CARD";
          ret.todo.field = field;
        } else if (field.type === "TAX") {
          ret.todo = {};
          ret.todo.action = "TAX";
          ret.todo.field = field;
        } else if (jail === 3) {
          ret.todo = {};
          ret.todo.action = "GOTOJAIL";
          ret.todo.field = field;
        }
        res.send(ret);
      });
    });
  });
});

app.post('/buy', (req, res) => {
  const params = req.body;
  const player_id = params.player;
  const field_id = params.field_id;
  const price = params.price;
  const cash = params.cash;

  if (typeof player_id == 'undefined' || typeof field_id == 'undefined' || typeof price == 'undefined' || typeof cash == 'undefined') {
    res.send('error');
    return;
  }

  newCash = cash - price;

  let sqlPlayers = 'UPDATE player SET cash = ' + newCash + ' WHERE id = ' + player_id;
  let queryPlayer = db.query(sqlPlayers, (errP, resultsPlayer) => {
    if (errP) throw errP;

    let sqlBoard = 'UPDATE board SET owner = ' + player_id + ' WHERE id = ' + field_id;
    let queryBoard = db.query(sqlBoard, (err, resultsBoard) => {
      if (err) throw err;

      var ret = {};
      ret.cash = newCash;
      res.send(ret);
    });
  });
});

app.post('/balance', (req, res) => {
  const params = req.body;
  const player = params.player;
  const cash = params.cash;
  const balance = params.balance;
  const newCash = cash + balance;

  let sql = 'update player set cash = ' + newCash + ' where id = ' + player;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;

    var ret = {};
    ret.cash = newCash;
    res.send(ret);
  });
});

app.post('/build', (req, res) => {
  const params = req.body;
  const player = params.player;
  const cash = params.cash;
  const field = params.field;
  const level = params.level;

  let sql = 'update player set cash = ' + cash + ' where id = ' + player;
  let query = db.query(sql, (err, results) => {
    if (err) throw err;

    var sqlBoard = 'update board set ';
    if (level == 5) {
      sqlBoard += 'hotel = 1, house = NULL';
    } else {
      sqlBoard += 'house = ' + level;
    }
    sqlBoard += ' where id = ' + field;

    let queryBoard = db.query(sqlBoard, (err, resultsBoard) => {
      if (err) throw err;

      res.send({ 'OK': 'OK' });
    });
  });
});

app.post('/pay', (req, res) => {

  const params = req.body;
  const field = params.field;
  const price = params.price;
  const payer = params.payer;
  const payerCash = params.payerCash;
  const recipient = params.recipient;
  const recipientCash = params.recipientCash;

  if (typeof field == 'undefined' || typeof price == 'undefined' || typeof payer == 'undefined' ||
    typeof payerCash == 'undefined' || typeof recipient == 'undefined' || typeof recipientCash == 'undefined') {
    res.send('error');
    return;
  }

  var payment = 0;
  if (field.type === "SPECIAL") {
    payment = price / 2;
  } else if (field.house == null && field.hotel == null && field.type !== "SPECIAL") {
    payment = price / 10;
  } else if (field.house == 1) {
    payment = price / 2;
  } else if (field.house == 2) {
    payment = price * 1.25;
  } else if (field.house == 3) {
    payment = price * 2.5;
  } else if (field.house == 4) {
    payment = price * 4;
  } else if (field.hotel == 1) {
    payment = price * 5;
  }

  const newPayerCash = payerCash - payment;
  const newRecipientCash = recipientCash + payment;

  let sqlPayer = 'UPDATE player SET cash = ' + newPayerCash + ' WHERE id = ' + payer;
  let queryPlayer = db.query(sqlPayer, (errP, resultsPayer) => {
    if (errP) throw errP;

    let sqlRecipient = 'UPDATE player SET cash = ' + newRecipientCash + ' WHERE id = ' + recipient;
    let queryBoard = db.query(sqlRecipient, (err, resultsRecipient) => {
      if (err) throw err;

      var ret = {};
      ret.payerCash = newPayerCash;
      ret.recipientCash = newRecipientCash;
      res.send(ret);
    });
  });
});

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);