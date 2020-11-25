export default class BoardService {
    constructor() {
        this.MOVE_URL = "http://localhost:3000/move"
        this.BUY_URL = "http://localhost:3000/buy"
        this.PAY_URL = "http://localhost:3000/pay"
    }

    async move(player, value) {
        var params = { "player": player, "value": value };
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