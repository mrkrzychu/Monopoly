import React, { Component } from 'react'

class ResponsePopup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            buildLevel: 0,
            buildPrice: 0
        }

        this.handleChangeBuildSelect = this.handleChangeBuildSelect.bind(this);
        this.handleBuildSubmit = this.handleBuildSubmit.bind(this);
        this.escFunction = this.escFunction.bind(this);
    }

    handleChangeBuildSelect(event) {
        const target = event.target;
        const value = Number(target.value);
        console.log(value)
        console.log(target.options)
        const price = Number(target.options[value - 1 - (5 - target.options.length)].getAttribute('price'));

        this.setState({
            buildLevel: value,
            buildPrice: price
        });
    }

    handleBuildSubmit(e) {
        if (typeof e !== "undefined") {
            e.preventDefault();
        }

        var level = 0;
        var price;
        if (this.state.buildLevel === 0 && this.state.buildPrice === 0) {
            level = Number(e.target['buildOption'].value);
            price = this.props.popup.field.price / 2;
        } else {
            level = this.state.buildLevel;
            price = this.state.buildPrice;
        }

        this.props.handleBuild(level, price, this.props.popup.field.id);

        this.setState({
            buildLevel: 0,
            buildPrice: 0
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            var popup = this.props.popup;
            switch (popup.action) {
                case 'BUY':
                    this.props.endTurn();
                    break;
                case 'PAY':
                    this.props.handlePay();
                    break;
                case 'BUILD':
                    this.props.endTurn();
                    break;
                case 'CARD':
                    this.props.handleCard();
                    break;
                case 'WINNER':
                    break;
                case 'TAX':
                    this.props.endTurn();
                    break;
                case 'GOTOJAIL':
                    this.props.endTurn();
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        var popup = this.props.popup;
        var field = popup.field;

        if (popup.computer === 1) {
            return null;
        }

        switch (popup.action) {
            case 'BUY':
                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <p>Czy chcesz kupić {field.name} za {field.price} zł?</p>
                            <button onClick={this.props.handleBuy} autoFocus>Tak, kupuję</button>
                            <button onClick={this.props.endTurn}>Nie, rezygnuję</button>
                        </div>
                    </div>
                )
            case 'PAY':
                var payment = 0;

                if (typeof field != 'undefined') {
                    var payprice = field.price;

                    if (field.type === "SPECIAL") {
                        payment = payprice / 2;
                    } else if (field.house == null && field.hotel == null && field.type !== "SPECIAL") {
                        payment = payprice / 10;
                    } else if (field.house === 1) {
                        payment = payprice / 2;
                    } else if (field.house === 2) {
                        payment = payprice * 1.25;
                    } else if (field.house === 3) {
                        payment = payprice * 2.5;
                    } else if (field.house === 4) {
                        payment = payprice * 4;
                    } else if (field.hotel === 1) {
                        payment = payprice * 5;
                    }
                }
                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <p>{field.name}</p>
                            <p>Płacisz czynsz w wysokości {payment}zł dla gracza {field.owner}</p>
                            <button onClick={this.props.handlePay} autoFocus >ok</button>
                        </div>
                    </div>
                )
            case 'BUILD':
                var house = field.house;
                var hotel = field.hotel;
                var buildPrice = field.price;
                var level = 0;
                if (hotel != null) {
                    level = 5;
                } else if (house != null) {
                    level = house;
                }
                var options = [];
                options.push({ level: 1, name: "1 Domek" });
                options.push({ level: 2, name: "2 Domki" });
                options.push({ level: 3, name: "3 Domki" });
                options.push({ level: 4, name: "4 Domki" });
                options.push({ level: 5, name: "Hotel" });
                options.splice(0, level);

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <form onSubmit={this.handleBuildSubmit}>
                                <p>{field.name}</p>
                                <p>Możesz rozbudować ulicę do poziomu:</p>
                                <select onChange={this.handleChangeBuildSelect} name='buildOption'>
                                    {options.map((opt) =>
                                        <option
                                            key={opt.level}
                                            value={opt.level}
                                            price={buildPrice / 2 * (opt.level - level)}>
                                            {opt.name} za {buildPrice / 2 * (opt.level - level)} zł
                                        </option>
                                    )}
                                </select>
                                <button autoFocus >ok</button>
                            </form>
                            <button onClick={this.props.endTurn}>Nie, rezygnuję</button>
                        </div>
                    </div>
                )
            case 'CARD':
                var fieldName = field.name;
                var card = popup.card;

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <div>
                                {fieldName}
                            </div>
                            <div>
                                {card.text}
                            </div>
                            <button onClick={this.props.handleCard} autoFocus >ok</button>
                        </div>
                    </div>
                )
            case 'WINNER':
                var winner = popup.player

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <div>
                                Wygrał gracz: {winner}
                            </div>
                            <button className="btn btn-danger m-2" onClick={this.props.newGame} autoFocus >Nowa gra</button>
                        </div>
                    </div>
                )
            case 'TAX':
                var price = field.price;
                var name = field.name;

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <div>
                                stanąłeś na {" " + name}
                            </div>
                            <div>
                                Płacisz {" " + price + " "} zł
                            </div>
                            <button onClick={this.props.endTurn} autoFocus >ok</button>
                        </div>
                    </div>
                )
            case 'GOTOJAIL':

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <div>
                                Idziesz do {field.name}
                            </div>
                            <div>
                                Przechodząc przez START nie pobierasz 200zł
                            </div>
                            <button onClick={this.props.endTurn} autoFocus >ok</button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
}

export default ResponsePopup
