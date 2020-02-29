import React, { Component } from 'react';
import { Row, Col } from 'antd';
import Chart from './Chart';

interface IState {}

export default class DmSendV extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <Row>
        <Col span={18}>
          <Chart dataEventId="dmsendv_data" />
        </Col>
        <Col span={6}></Col>
      </Row>
    );
  }
}
