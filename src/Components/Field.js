import React, { Component } from 'react'
import icons from 'glyphicons'


class Field extends Component {

  render() {
    const item = this.props.item;
    const players = this.props.players;
    const color = this.props.item.color;
    const hotel = item.hotel;
    const house = item.house;
    const houses = [];
    for (var i = 1; i <= house; i++) {
      houses.push(icons.home)
    }

    return (
      <div className="space property">
        <div className="boardContainer">
          <div className='fieldHeader' style={{ backgroundColor: color }}></div>
          <div>
            {item.name}
          </div>
          <div className='housePlaceholder'>
            {hotel === 1 &&
              <h6>
                {icons.homes}
              </h6>
            }
            {house > 0 && hotel !== 1 &&
              <h6>
                {houses}
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
              cena: {item.price + " "} zł
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