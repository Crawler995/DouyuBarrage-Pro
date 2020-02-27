import React, { Component } from 'react'
import Chart from './Chart'
import { Typography } from 'antd'

export default class DmSendV extends Component {
  render() {
    return (
      <div>
        <div style={{
          width: '100%',
          height: '60vh'
        }}>
          <Chart
            dataEventId="dmsendv_data"
          />
        </div>

        <Typography.Title level={4}>实时弹幕发送速度</Typography.Title>
      </div>
    )
  }
}
