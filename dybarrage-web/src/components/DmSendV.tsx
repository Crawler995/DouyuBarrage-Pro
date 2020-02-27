import React, { Component } from 'react';
import Chart from './Chart';

export default class DmSendV extends Component {
  render() {
    return (
      <div>
        <div style={{
          width: '100%',
          height: 'calc(100vh - 130px)'
        }}>
          <Chart
            dataEventId="dmsendv_data"
          />
        </div>
      </div>
    )
  }
}
