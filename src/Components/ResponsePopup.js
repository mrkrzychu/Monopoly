import React, { Component } from 'react'

class ResponsePopup extends Component {
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
                    var price = field.price;

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
                var level = 0;
                if (hotel != null) {
                    level = 5;
                } else if (house != null) {
                    level = house;
                }

                var options = [];
                options.push({ level: 1, name: "Domek" });
                options.push({ level: 2, name: "Domek" });
                options.push({ level: 3, name: "Domek" });
                options.push({ level: 4, name: "Domek" });
                options.push({ level: 5, name: "Hotel" });
                console.log(options)
                options.splice(0, level);
                console.log(options)

                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <p>
                                Czy chcesz rozbudować ulicę?
                            </p>
                            <select>
                                {options.map((opt) =>
                                    <option value={opt.level}>{opt.name} za {price/2 * (opt.level - level)}</option>
                                )}
                            </select>
                            <button onClick={this.props.handleBuild}>ok</button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
}

export default ResponsePopup
