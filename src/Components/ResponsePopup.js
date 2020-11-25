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
                return (
                    <div className='popup'>
                        <div className='popupContent'>
                            <p>
                                Płacisz czynsz w wysokości {field.price}zł dla gracza {field.owner}
                            </p>
                            <button onClick={this.props.handlePay}>ok</button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
}

export default ResponsePopup
