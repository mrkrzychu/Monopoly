import React, { Component } from 'react'

class Players extends Component {

    render() {
        return (
            <div className='row'>
                {this.props.players.map((pl) =>
                    <div className='col-2 border border-dark mr-1'
                        style={{ backgroundColor: pl.color_player, color: '#FFFFFF' }}
                        key={pl.id}>
                        <div className="card-body"  >
                            <h5 className="card-title h4">
                                {pl.name}
                            </h5>
                            <span className="card-text h6"><div>
                                kasa: {pl.cash}
                            </div>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default Players
