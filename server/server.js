const express = require('express');
// const cors = require('cors');
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



app.get('/1', (req, res) => {
  res.send(123);
});

// select records
app.get('/getBoard', (req, res) => {
  let sqlBoard = 'SELECT * FROM board';
  let queryBoard = db.query(sqlBoard, (errB, fields) => {
    if (errB) throw errB;
    let sqlPlayer = 'SELECT * FROM player';
    let queryPlayer = db.query(sqlPlayer, (errP, players) => {
      if (errP) throw errP;
      for (var pl of players) {
        if (typeof fields[pl.position].players == 'undefined') {
          fields[pl.position].players = [];
        }
        fields[pl.position].players.push(pl);
      }

      var board = { "fields": fields, "players": players };

      res.send(board);
    });
  });
});

//add player
app.post('/newplayer', (req, res) => {
  const params = req.body;

  let selectSql = 'select max(id) as maxid from player';
  let selectQuery = db.query(selectSql, (err, selectResult) => {
    if (err) throw err;

    var nextId = selectResult[0].maxid + 1;
    let sqlParams = { id: nextId, name: params.name, cash: 1000, color_player: params.color, position: 0 };
    let sql = 'INSERT INTO player SET ?';
    let query = db.query(sql, sqlParams, (err, result) => {
      if (err) throw err;

      res.send(sqlParams);
    });
  });
});

// update record "move"
app.post('/move', (req, res) => {
  const params = req.body;
  const player = params.player;
  const move = params.value;

  if (typeof player == 'undefined' || typeof move == 'undefined') {
    res.send('error');
    return;
  }

  let sqlPlayer = 'SELECT position, cash FROM player WHERE id = ' + player;
  let queryPlayer = db.query(sqlPlayer, (errP, resultsPlayer) => {
    if (errP) throw errP;

    const curPosition = resultsPlayer[0].position; //select position from player where id = $player
    var newPosition = (curPosition + move) % 40;
    var newCash = resultsPlayer[0].cash;

    if (newPosition < curPosition) {
      newCash += 200;
    }

    if (newPosition === 4) {
      newCash -= 200;
    } else if (newPosition === 38) {
      newCash -= 100;
    }

    if (newPosition == 30) {
      newPosition = 10;
    }

    ////////////////////////////////////////
    // zawsze wskakuje na pole do zaplaty
    if (player == 0) {
      newPosition = 23;
    }
    ////////////////////////////////////////

    let sql = 'UPDATE player SET position = ' + newPosition + ' ,cash = ' + newCash + ' WHERE id = ' + player;
    let query = db.query(sql, (err, result) => {
      if (err) throw err;

      let sqlField = 'select * from board where id = ' + newPosition;
      let query = db.query(sqlField, (err, fields) => {
        var field = fields[0];
        var ret = {};
        ret.old = curPosition;
        ret.new = newPosition;
        ret.cash = newCash;
        if (field.owner == null && field.price != null) {
          ret.todo = {};
          ret.todo.action = "BUY";
          ret.todo.field = field;
          //moze tutaj wrzucic pola do zaplaty id 4 i 38
        } else if (field.owner != null && field.owner != player) {
          ret.todo = {};
          ret.todo.action = "PAY";
          ret.todo.field = field;
        } else if (field.owner == player) {
          ret.todo = {};
          ret.todo.action = "BUILD";
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
  if (field.house == null && field.hotel == null) {
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