import React, { Component } from 'react'
import Field from './Field';
import Players from './Players';
import ResponsePopup from './ResponsePopup';
import BoardService from './BoardService';

class Board extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            isLoaded: false,
            fields: [],
            players: [],
            cards: [],
            currplayer: 0,
            popup: {},
            dices: [],
            activePlayers: 0
        }

        this.handleMove = this.handleMove.bind(this);
        this.movePlayer = this.movePlayer.bind(this);
        this.handleBuy = this.handleBuy.bind(this);
        this.handlePay = this.handlePay.bind(this);
        this.handleNewPlayer = this.handleNewPlayer.bind(this);
        this.handleBuild = this.handleBuild.bind(this);
        this.handleCard = this.handleCard.bind(this);
        this.endTurn = this.endTurn.bind(this);
        this.newGame = this.newGame.bind(this);
        this.computerMove = this.computerMove.bind(this);
        this.boardService = new BoardService();

    }

    updateFieldsPlayersState(fields, players) {
        for (var i = 0; i < players.length; i++) {
            var pl = players[i];

            if (pl.cash < 0 && pl.lost !== 1) {
                pl.lost = 1;

                this.setState({
                    activePlayers: this.state.activePlayers - 1
                });

                if (fields[pl.position].players.length === 1) {
                    fields[pl.position].players = undefined;
                } else {
                    fields[pl.position].players.splice(i, 1);
                }

                for (let j = 0; j < fields.length; j++) {
                    var field = fields[j];

                    if (field.owner === pl.id) {
                        field.owner = null;
                        field.house = null;
                        field.hotel = null;
                    }
                }
                this.boardService.bancrupt(pl.id);
            }
        }

        this.setState({
            fields: fields,
            players: players
        });
    }

    handleMove(e) {
        if (typeof e !== "undefined") {
            e.preventDefault();
        }

        var a = Math.floor(Math.random() * 6) + 1;
        var b = Math.floor(Math.random() * 6) + 1;

        this.setState({
            dices: [a, b]
        });

        var players = this.state.players;
        var pl = players[this.state.currplayer];
        if (pl.jail > 0) {
            if (a !== b) {
                a = 0;
                b = 0;
            }
        }

        var move = (a + b) % 40;

        this.movePlayer(move);
    }

    movePlayer(move, jail) {
        if (typeof jail === 'undefined') {
            jail = false;
        }

        this.boardService.move(this.state.currplayer, move, jail).then((res) => {
            var old = res.old;
            var neww = res.new;
            var newCash = res.cash;
            var jail = res.jail;
            var fields = this.state.fields;
            var players = this.state.players;
            var pl;
            players[this.state.currplayer].cash = newCash;
            players[this.state.currplayer].jail = jail;

            if (fields[old].players.length === 1) {
                pl = fields[old].players[0];
                fields[old].players = undefined;
            } else {
                for (var i = 0; i < fields[old].players.length; i++) {
                    if (fields[old].players[i].id === this.state.currplayer) {
                        pl = fields[old].players[i];
                        fields[old].players.splice(i, 1);
                    }
                }
            }
            if (typeof fields[neww].players == 'undefined') {
                fields[neww].players = [];
            }
            pl.jail = jail;
            fields[neww].players.push(pl);

            players[this.state.currplayer].position = neww;

            this.updateFieldsPlayersState(fields, players);
            if (typeof res.todo != 'undefined') {
                if (res.todo.action === 'CARD') {
                    var cards = this.state.cards;
                    var chanceCards = cards.slice(0, 14);
                    var cashCards = cards.slice(14, 28);
                    var number = Math.floor(Math.random() * 14);
                    var fieldName = res.todo.field.name;
                    var card;

                    if (fieldName === "SZANSA") {
                        card = chanceCards[number];
                    } else {
                        card = cashCards[number];
                    }
                    res.todo.card = card;
                }

                if (pl.computer === 1) {
                    res.todo.computer = 1;
                    this.setState({
                        popup: res.todo
                    });
                    this.computerPopup(res.todo);
                } else {
                    this.setState({
                        popup: res.todo
                    });
                }

            } else {
                this.endTurn();
            }
        });
    }

    handleBuy() {
        var field_id = this.state.players[this.state.currplayer].position;
        var price = this.state.fields[field_id].price;
        var cash = this.state.players[this.state.currplayer].cash;

        this.boardService.buy(this.state.currplayer, field_id, price, cash).then((res) => {
            var cash = res.cash;
            var fields = this.state.fields;
            var players = this.state.players;
            fields[field_id].owner = this.state.currplayer;
            players[this.state.currplayer].cash = cash;
            this.updateFieldsPlayersState(fields, players);
            this.endTurn();
        });
    }

    handlePay() {
        var players = this.state.players;
        var fields = this.state.fields;
        var field_id = players[this.state.currplayer].position;
        var field = fields[field_id];
        var price = fields[field_id].price;
        var payer = players[this.state.currplayer].id;
        var recipient = fields[field_id].owner;
        var payerCash = players[payer].cash;
        var recipientCash = players[recipient].cash;

        this.boardService.pay(field, price, payer, payerCash, recipient, recipientCash).then((res) => {

            players[payer].cash = res.payerCash;
            players[recipient].cash = res.recipientCash;

            this.updateFieldsPlayersState(fields, players);

            this.endTurn();
        });
    }


    handleNewPlayer(name, color, computer) {
        this.boardService.newPlayer(name, color, computer).then((res) => {
            var players = this.state.players;
            var fields = this.state.fields;
            players.push(res);

            if (typeof fields[0].players == 'undefined') {
                fields[0].players = [];
            }
            fields[0].players.push(res);

            this.updateFieldsPlayersState(fields, players);

            this.setState({
                activePlayers: this.state.activePlayers + 1
            });
        });
    }

    handleCard() {
        var players = this.state.players;
        var pl = players[this.state.currplayer];
        var card = this.state.popup.card;

        if (card.goto !== null) {
            var move;
            var jail = false;
            if (card.goto >= 0) {
                var curPosition = this.state.players[this.state.currplayer].position;
                move = (card.goto - curPosition + 40) % 40;
                if (card.goto === 10) {
                    jail = true;
                }
            } else {
                move = card.goto;
            }
            this.movePlayer(move, jail);

        } else if (card.balance !== null) {
            this.boardService.balance(pl.id, pl.cash, card.balance).then((res) => {
                var newCash = res.cash;
                pl.cash = newCash;
                this.updateFieldsPlayersState(this.state.fields, players);
            });
            this.endTurn();

        } else if (card.balanceEach !== null) {
            var myBalance = card.balanceEach * (players.length - 1);

            this.boardService.balance(pl.id, pl.cash, myBalance).then((res) => {
                var newCash = res.cash;
                pl.cash = newCash;
                this.updateFieldsPlayersState(this.state.fields, players);
            });

            players.map((pl) => {
                if (pl.id === this.state.currplayer) {
                    return false;
                }

                this.boardService.balance(pl.id, pl.cash, card.balanceEach * (-1)).then((res) => {
                    var newCash = res.cash;
                    pl.cash = newCash;
                    this.updateFieldsPlayersState(this.state.fields, players);
                });
                return true;
            });

            this.endTurn();
        } else {
            window.alert("something went wrong");
            this.endTurn();
        }
    }

    handleBuild(level, price, field_id) {
        var fields = this.state.fields;
        var field = fields[field_id];

        if (level === 5) {
            field.house = null;
            field.hotel = 1;
        } else {
            field.house = level;
        }

        var players = this.state.players;
        var pl = players[this.state.currplayer];
        pl.cash -= price;

        this.boardService.build(this.state.currplayer, pl.cash, field_id, level).then((res) => {
            this.updateFieldsPlayersState(fields, players);
        });

        this.endTurn();
    }

    endTurn() {
        if (this.state.activePlayers === 1) {
            this.setState({
                popup: { action: "WINNER", playerName: this.state.players[this.state.currplayer].name }
            });
            return;
        }

        var nextPlayer = (this.state.currplayer + 1) % this.state.players.length;
        while (this.state.players[nextPlayer].lost === 1) {
            nextPlayer = (nextPlayer + 1) % this.state.players.length;
        }

        var computer = this.state.players[nextPlayer].computer;

        if (computer) {
            this.setState({
                popup: {},
                currplayer: nextPlayer
            }, this.computerMove);
        } else {
            this.setState({
                popup: {},
                currplayer: nextPlayer
            });
        }

    }

    computerMove() {
        this.handleMove()
    }

    computerPopup(popup) {
        switch (popup.action) {
            case 'BUY':
                if (Math.random() < 0.8) {
                    this.handleBuy();
                } else {
                    this.endTurn();
                }
                break;
            case 'PAY':
                this.handlePay();
                break;
            case 'BUILD':
                if (popup.field.price < this.state.players[this.state.currplayer].cash && popup.field.hotel !== 1) {
                    var field = popup.field;
                    var house = field.house;
                    var buildPrice = field.price / 2;
                    var level = house || 0;

                    this.handleBuild(level + 1, buildPrice, field.id);
                } else {
                    this.endTurn();
                }
                break;
            case 'CARD':
                this.handleCard();
                break;
            case 'WINNER':
                break;
            case 'TAX':
                this.endTurn();
                break;
            case 'GOTOJAIL':
                this.endTurn();
                break;
            default:
                break;
        }
    }

    newGame() {
        this.boardService.newGame().then((res) => {
            this.setState({
                error: null,
                isLoaded: false,
                fields: [],
                players: [],
                cards: [],
                currplayer: 0,
                popup: {},
                dices: [],
                activePlayers: 0
            });
            this.getBoard();
        });
    }

    componentDidMount() {
        this.getBoard();
    }

    getBoard() {
        fetch("http://localhost:3000/getBoard")
            .then(response => response.json())
            .then(
                (result) => {
                    var activePlayers = 0;
                    result.players.map((pl) => {
                        if (pl.lost !== 1) {
                            activePlayers++;
                        }
                    });
                    this.setState({
                        fields: result.fields,
                        players: result.players,
                        cards: result.cards,
                        activePlayers: activePlayers,
                        isLoaded: true
                    });

                    if (activePlayers === 1 && result.players.length > 1) {
                        this.setState({
                            popup: { action: "WINNER", playerName: this.state.players[this.state.currplayer].name }
                        });
                    }
                    console.log(activePlayers)
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        const { error, isLoaded, fields } = this.state;
        if (error) {
            return <div>Błąd: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Ładowanie...</div>;
        } else {

            var start = fields[0];
            var bottom = fields.slice(1, 10).reverse();
            var jail = fields[10];
            var left = fields.slice(11, 20).reverse();
            var parking = fields[20];
            var top = fields.slice(21, 30);
            var goto = fields[30];
            var right = fields.slice(31, 40);

            var players = this.state.players;

            return (
                <div className='table'>
                    <div className='row'>
                        <div className='col-1 offset-11'>
                            <button className='btn btn-danger m-1' onClick={this.newGame}>Nowa gra</button>
                        </div>
                    </div>
                    <div className='board'>
                        <div className="center">
                            <div className="community-chest-deck">
                                <h2 className="label">Kasa Społeczna</h2>
                                <div className="deck"></div>
                            </div>
                            <h1 className="title">MONOPOLY</h1>
                            <div className="chance-deck">
                                <h2 className="label">Szansa</h2>
                                <div className="deck"></div>
                            </div>
                            {(this.state.players.length > 0) && (
                                <div className="moveButton">
                                    <form onSubmit={this.handleMove}>
                                        <button className="btn btn-warning" >wykonaj ruch</button>
                                    </form>
                                    <h6 className="text-center">
                                        tura gracza: {this.state.players[this.state.currplayer].name}
                                    </h6>
                                </div>
                            )}
                            <div className="dices">
                                <h5>Rzut&nbsp;kośćmi:</h5>
                                <div key='dice1'><h3>{this.state.dices[0]}</h3></div>
                                <div key='dice2'><h3>{this.state.dices[1]}</h3></div>
                            </div>
                        </div>
                        <div className="space corner go">
                            <Field item={start} />
                        </div>
                        <div className="boardRow horizontal-row bottom-row">
                            {bottom.map((item) =>
                                <Field item={item} key={item.id} players={players} />
                            )}
                        </div>
                        <div className="space corner jail">
                            <Field item={jail} />
                        </div>
                        <div className="boardRow vertical-row left-row">
                            {left.map((item) =>
                                <Field item={item} key={item.id} players={players} />
                            )}
                        </div>
                        <div className="space corner free-parking">
                            <Field item={parking} />
                        </div>
                        <div className="boardRow horizontal-row top-row">
                            {top.map((item) =>
                                <Field item={item} key={item.id} players={players} />
                            )}
                        </div>
                        <div className="space corner go-to-jail">
                            <Field item={goto} />
                        </div>
                        <div className="boardRow vertical-row right-row">
                            {right.map((item) =>
                                <Field item={item} key={item.id} players={players} />
                            )}
                        </div>
                    </div>
                    <Players players={this.state.players} handleNewPlayer={this.handleNewPlayer} />
                    <ResponsePopup
                        popup={this.state.popup}
                        handleBuy={this.handleBuy}
                        endTurn={this.endTurn}
                        handlePay={this.handlePay}
                        handleBuild={this.handleBuild}
                        cards={this.state.cards}
                        handleCard={this.handleCard}
                        newGame={this.newGame}
                    />
                    <button onClick={this.computerMove}>Komputery</button>
                </div>
            )
        }
    }
}

export default Board
