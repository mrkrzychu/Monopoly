import React, { Component } from 'react'
import Field from './Field';
import Players from './Players';
import ResponsePopup from './ResponsePopup';
import BoardService from './BoardService'


class Board extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            isLoaded: false,
            fields: [],
            players: [],
            allplayers: 2, //zmienic
            currplayer: 0,
            popup: {}
        }

        this.handleMove = this.handleMove.bind(this);
        this.handleBuy = this.handleBuy.bind(this);
        this.handlePay = this.handlePay.bind(this);
        this.endTurn = this.endTurn.bind(this);
        this.boardService = new BoardService();

    }

    handleMove(e) {
        e.preventDefault();

        var a = Math.floor(Math.random() * 6) + 1;
        var b = Math.floor(Math.random() * 6) + 1;
        var move = (a + b) % 40;
        this.boardService.move(this.state.currplayer, move).then((res) => {
            var old = res.old;
            var neww = res.new;
            var newCash = res.cash;
            var fields = this.state.fields;
            var players = this.state.players;
            var pl;

            players[this.state.currplayer].cash = newCash;

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
            fields[neww].players.push(pl);

            players[this.state.currplayer].position = neww;

            this.setState({
                fields: fields,
                players: players
            });

            if (typeof res.todo != 'undefined') {
                this.setState({
                    popup: res.todo
                });
            } else {
                this.endTurn();
            }
        });
    }

    handleBuy() {
        this.setState({
            popup: {}
        });
        var field_id = this.state.players[this.state.currplayer].position;
        var price = this.state.fields[field_id].price;
        var cash = this.state.players[this.state.currplayer].cash;

        this.boardService.buy(this.state.currplayer, field_id, price, cash).then((res) => {
            var cash = res.cash;
            var fields = this.state.fields;
            var players = this.state.players;
            fields[field_id].owner = this.state.currplayer;
            players[this.state.currplayer].cash = cash;
            this.setState({
                fields: fields,
                players: players
            });
            this.endTurn();
        });
    }

    handlePay() {
        this.setState({
            popup: {}
        });
        var field_id = this.state.players[this.state.currplayer].position;
        var field = this.state.fields[field_id];
        var price = this.state.fields[field_id].price;
        var payer = this.state.players[this.state.currplayer].id;
        var recipient = this.state.fields[field_id].owner;
        var payerCash = this.state.players[payer].cash;
        var recipientCash = this.state.players[recipient].cash;

        this.boardService.pay(field, price, payer, payerCash, recipient, recipientCash).then((res) => {
            console.log(res)
        });
    }

    endTurn() {
        this.setState({
            popup: {},
            currplayer: (this.state.currplayer + 1) % this.state.allplayers
        });
    }

    componentDidMount() {
        fetch("http://localhost:3000/getBoard")
            .then(response => response.json())
            .then(
                (result) => {
                    this.setState({
                        fields: result.fields,
                        players: result.players,
                        isLoaded: true
                    });
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
                        <form onSubmit={this.handleMove}>
                            <button className="btn btn-warning" >wykonaj ruch</button>
                        </form>
                        <h6 className="text-center">
                            tura gracza: {this.state.currplayer}
                        </h6>
                    </div>
                    <Players players={this.state.players} />
                    <ResponsePopup popup={this.state.popup} handleBuy={this.handleBuy} endTurn={this.endTurn} handlePay={this.handlePay} />

                </div>
            )
        }
    }
}

export default Board
