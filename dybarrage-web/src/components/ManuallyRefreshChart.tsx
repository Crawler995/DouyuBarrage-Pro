import React, { Component } from 'react';
import { Button } from 'antd';
import ReactEcharts, { ObjectMap } from 'echarts-for-react';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface IState {
  option: ObjectMap;
  chartLoading: boolean;
}

interface IProps {
  initOption: ObjectMap;
  dataFn: () => Promise<any>;
}

export default class ManuallyRefreshChart extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      option: props.initOption,
      chartLoading: false
    };
  }

  componentDidMount() {
    getWebSocketClient().addConnectSuccessHook(this.getData);
  }

  getData = () => {
    this.setState({ chartLoading: true });

    this.props
      .dataFn()
      .then(res => {
        if (res.data.error === 0) {
          const data = res.data.data;
          console.log(data);
          this.setState({
            option: data
          });
        }
        this.setState({ chartLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ chartLoading: false });
      });
  };

  render() {
    return (
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 160px)'
        }}
      >
        <Button onClick={() => this.getData()}>刷新</Button>
        <ReactEcharts
          showLoading={this.state.chartLoading}
          option={this.state.option}
          style={{
            width: '100%',
            height: 'calc(100vh - 160px)'
          }}
        />
      </div>
    );
  }
}
