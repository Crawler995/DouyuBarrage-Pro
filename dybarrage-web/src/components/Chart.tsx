import React, { Component } from 'react';
import ReactEcharts, { ObjectMap } from 'echarts-for-react';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import periodlyReceiveMsgTypes from '../network/websocket/msgType/periodlyReceiveMsgTypes';

interface IProps {
  dataEventId: periodlyReceiveMsgTypes
}

interface IState {
  option: ObjectMap
}

export default class Chart extends Component<IProps, IState> {
  private isFirstGetData: boolean;

  constructor(props: IProps) {
    super(props);

    this.state = {
      option: {}
    }

    this.isFirstGetData = true;
  }
  
  subscribeEvents = () => {
    const ws = getWebSocketClient();
    ws.addSubscriber(this.props.dataEventId, (data: any) => {
      this.setOption(JSON.parse(data));
    });
  }

  componentDidMount() {
    this.subscribeEvents();
  }

  setOption = (option: ObjectMap) => {
    if(this.isFirstGetData) {
      this.setState({ option });
      this.isFirstGetData = false;
    } else {
      this.setState({ option: {...this.state.option, series: option} });
    }
  }

  render() {
    return (
      <ReactEcharts
        option={this.state.option}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }
}
