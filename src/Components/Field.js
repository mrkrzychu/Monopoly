import React, { Component } from 'react'
import icons from 'glyphicons'


class Field extends Component {

  render() {
    const item = this.props.item;
    const players = this.props.players;
    const color = this.props.item.color;

    return (
      <div className="space property">
        <div className="boardContainer">
          <div className='fieldHeader' style={{ backgroundColor: color }}></div>
          <div>
            {item.name}
          </div>
          <div className='housePlaceholder'>
            {item.house > 0 &&
              <h6>
                {icons.home + ": " + item.house}
              </h6>
            }
            {item.hotel === 1 &&
              <h6>
                {icons.homes}
              </h6>
            }
          </div>
          <div className='playerIconPlaceholder'>
            {!(typeof item.players == 'undefined') && (
              <div className='playerHeader' >
                {item.players.map((pl) =>
                  <div key={pl.id} className='playerIcon' style={{ background: pl.color_player }}>&nbsp;</div>
                )}
              </div>
            )}
          </div>
          {(typeof item.price == 'number') && (
            <div key={item.price}>
              cena: {item.price}
            </div>
          )}
          <div>
            {(typeof item.owner == 'number') ? (
              <div>
                <div className='owner' key={item.owner} style={{ backgroundColor: players[item.owner].color_player, color: '#FFFFFF' }}>
                  {players[item.owner].name}
                </div>
              </div>
            ) : (
                <div>
                  &nbsp;
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}


export default Field