export default class BoardService {
    constructor() {
        this.MOVE_URL = "http://localhost:3000/move";
        this.BUY_URL = "http://localhost:3000/buy";
        this.PAY_URL = "http://localhost:3000/pay";
        this.NEWPLAYER_URL = "http://localhost:3000/newplayer";
        this.BUILD_URL = "http://localhost:3000/build";
        this.BALANCE_URL = "http://localhost:3000/balance";
        this.NEWGAME_URL = "http://localhost:3000/newgame";
        this.BANCRUPT_URL = "http://localhost:3000/bancrupt";
    }

    async move(player, value, jail) {
        var params = { player, value, jail };
        return this.fetchRequest(params, this.MOVE_URL);
    }

    async buy(player, field_id, price, cash) {
        var params = { "player": player, "field_id": field_id, "price": price, "cash": cash };
        return this.fetchRequest(params, this.BUY_URL);
    }

    async pay(field, price, payer, payerCash, recipient, recipientCash) {
        var params = { field, price, payer, payerCash, recipient, recipientCash };
        return this.fetchRequest(params, this.PAY_URL);
    }

    async newPlayer(name, color) {
        var params = { name, color };
        return this.fetchRequest(params, this.NEWPLAYER_URL);
    }

    async balance(player, cash, balance) {
        var params = { player, cash, balance };
        return this.fetchRequest(params, this.BALANCE_URL);
    }

    async build(player, cash, field, level) {
        var params = { player, cash,  field, level };
        return this.fetchRequest(params, this.BUILD_URL);
    }

    async newGame() {
        var params = {};
        return this.fetchRequest(params, this.NEWGAME_URL);
    }

    async bancrupt(player) {
        var params = {player};
        return this.fetchRequest(params, this.BANCRUPT_URL);
    }

    async fetchRequest(params, url) {
        return fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
        })
            .then((response) => {
                if (!response.ok) {
                    console.log(response);
                    throw new Error("HTTP error, status = " + response.status);
                }
                return response.json();
            })
            .catch((error) => {
                this.handleError(error);
            });
    }

    handleError(error) {
        console.log(error);
        console.log(error.message);
    }
}