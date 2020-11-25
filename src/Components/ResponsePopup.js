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
    }

    handleChangeBuildSelect(event) {
        const target = event.target;
        const value = target.value;
        const price = target.options[value - 1].getAttribute('price');

        this.setState({
            buildLevel: value,
            buildPrice: price
        });
    }

    handleBuildSubmit(e) {
        e.preventDefault();
        this.props.handleBuild();

        this.setState({
            buildLevel: 0,
            buildPrice: 0
        });
    }

    render() {
        var popup = this.props.popup;
        var field = popup.field;

        switch (popup.action) {
            case 'BUY':
                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <p>Czy chcesz kupić {field.name} za {field.price} zł?</p>
                            <button onClick={this.props.handleBuy}>Tak, kupuję</button>
                            <button onClick={this.props.endTurn}>Nie, rezygnuję</button>
                        </div>
                    </div>
                )
            case 'PAY':
                var payment = 0;

                if (typeof field != 'undefined') {
                    var payprice = field.price;

                    if (field.house == null && field.hotel == null) {
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
                            <p>
                                Płacisz czynsz w wysokości {payment}zł dla gracza {field.owner}
                            </p>
                            <button onClick={this.props.handlePay}>ok</button>
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

                // if (options.length > 0) {
                //     this.setState({
                //         buildLevel: options[0].level,
                //         buildPrice: buildPrice / 2
                //     });
                // }

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <form onSubmit={this.handleBuildSubmit}>
                                <p>Możesz rozbudować ulicę do poziomu:</p>
                                <select onChange={this.handleChangeBuildSelect}>
                                    {options.map((opt) =>
                                        <option
                                            key={opt.level}
                                            value={opt.level}
                                            price={buildPrice / 2 * (opt.level - level)}>
                                            {opt.name} za {buildPrice / 2 * (opt.level - level)} zł
                                        </option>
                                    )}
                                </select>
                                <button>ok</button>
                            </form>
                            <button onClick={this.props.endTurn}>Nie, rezygnuję</button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
}

export default ResponsePopup
