import React, { Component } from 'react'

class Players extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playerName: "",
            playerColor: this.getNewColor()
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    getNewColor() {
        var color = "#" + Math.floor(Math.random() * 16).toString(16)
            + Math.floor(Math.random() * 16).toString(16)
            + Math.floor(Math.random() * 16).toString(16)
            + Math.floor(Math.random() * 16).toString(16)
            + Math.floor(Math.random() * 16).toString(16)
            + Math.floor(Math.random() * 16).toString(16);
        return color;
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.handleNewPlayer(this.state.playerName, this.state.playerColor);

        this.setState({
            playerName: "",
            playerColor: this.getNewColor()
        });
    }

    render() {
        return (
            <div className='row'>
                {this.props.players.map((pl) =>
                    <div className='col-1'
                        key={pl.id}>
                        <div className="card-body border border-dark" style={{ backgroundColor: pl.color_player, color: '#FFFFFF' }}>
                            <h6 className="card-title">
                                gracz:{pl.id}
                            </h6>
                            <h6 className="card-title">
                                {pl.name}
                            </h6>
                            <span className="card-text">
                                {pl.cash + ' '}zł
                            </span>
                            <div>
                                {pl.lost === 1 &&
                                    <div className='bancrupt card-body border border-danger'>
                                        <div className="line1"></div>
                                        <div className="line2"></div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )}
                <div className="col-2">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <input
                                className="form-control"
                                name="playerName"
                                placeholder="Imię gracza"
                                required
                                onChange={this.handleChange}
                                value={this.state.playerName} />
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-6">
                                    <input
                                        className="form-control"
                                        value={this.state.playerColor}
                                        type="color"
                                        name="playerColor"
                                        onChange={this.handleChange} />
                                </div>
                                <div className="col-6">
                                    <button className="btn btn-warning btn-block">dodaj</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Players
