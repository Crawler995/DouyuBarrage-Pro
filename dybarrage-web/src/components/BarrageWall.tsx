import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import Barrage from './Barrage';
import { Dropdown, Menu } from 'antd';

interface IProps {
  moveTime: number;
  fontSize: number;
  showAvatar: boolean;
  opacity: number;
}

interface IState {
  isStart: boolean;
  canStart: boolean;
}

export default class BarrageWall extends Component<IProps, IState> {
  private wh: number = window.innerWidth;
  private barrageWallIns: HTMLDivElement | null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      isStart: false,
      canStart: false
    };

    this.barrageWallIns = null;
  }

  componentDidMount() {
    getWebSocketClient().addSubscriber('start_crawl_success', () => this.setState({
      canStart: true
    }));
    getWebSocketClient().addSubscriber('stop_crawl_success', () => this.setState({
      canStart: false,
      isStart: false
    }));
  }

  startHandleDmData = () => {
    getWebSocketClient().addSubscriber('lastsec_dm', (data: any) => {
      JSON.parse(data).forEach((item: any) => {
        const newBarrageElement = React.createElement(Barrage, {
          showAvatar: this.props.showAvatar,
          content: item.dm_content,
          avatarUrl: `https://apic.douyucdn.cn/upload/${item.sender_avatar_url}_middle.jpg`,
          initY: Math.random() * this.wh,
          moveTime: this.props.moveTime,
          fontSize: this.props.fontSize,
          onDisappear: this.removeBarrageDom.bind(this)
        });
        const wrapper = document.createElement('div');
        this.barrageWallIns?.appendChild(wrapper);
        ReactDOM.render(newBarrageElement, wrapper);
      });
    });
  };

  stopHandleDmData = () => {
    getWebSocketClient().removeSubscriber('lastsec_dm');
  };

  removeBarrageDom = (ins: HTMLDivElement) => {
    const parentNode = ins.parentNode as Node;
    ReactDOM.unmountComponentAtNode(ins.parentElement as Element);
    this.barrageWallIns?.removeChild(parentNode); // not of type node
  }

  removeAllBarrageDom = () => {
    ReactDOM.unmountComponentAtNode(this.barrageWallIns as HTMLDivElement);
  }

  start = () => {
    this.startHandleDmData();
  };

  stop = () => {
    this.stopHandleDmData();
    this.removeAllBarrageDom();
  };

  render() {
    return (
      <React.Fragment>
      <Dropdown.Button
        disabled={!this.state.canStart}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px'
        }}
        onClick={(e) => {
          this.state.isStart ? this.stop() : this.start();
          this.setState({ isStart: !this.state.isStart });
        }}
        overlay={
          <Menu>
            <Menu.Item key='1'>
              111
            </Menu.Item>
            <Menu.Item key='2'>
              222
            </Menu.Item>
          </Menu>
        }
      >
        { this.state.isStart ? '关闭弹幕墙' : '开启弹幕墙' }
      </Dropdown.Button>
      <div
        ref={e => this.barrageWallIns = e}
        style={{
          display: this.state.isStart ? 'block' : 'none',
          position: 'absolute',
          zIndex: 9999,
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          opacity: this.props.opacity,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
      </div>
      </React.Fragment>
    );
   }
}
