import React, { Component } from 'react';
import ReactEcharts, { ObjectMap } from 'echarts-for-react';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import periodlyReceiveMsgTypes from '../network/websocket/msgType/periodlyReceiveMsgTypes';

interface IProps {
  dataEventId: periodlyReceiveMsgTypes;
}

interface IState {
  option: ObjectMap;
}

export default class Chart extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      option: {}
    };
  }

  subscribeEvents = () => {
    const ws = getWebSocketClient();
    ws.addSubscriber(this.props.dataEventId, (data: any) => {
      this.setOption(JSON.parse(data));
    });
  };

  componentDidMount() {
    this.subscribeEvents();
  }

  setOption = (option: ObjectMap) => {
    this.setState({ option });
  };

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 130px)'
        }}
      >
        <ReactEcharts option={this.state.option} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }
}
