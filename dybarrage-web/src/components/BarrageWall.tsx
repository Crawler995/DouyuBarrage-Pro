import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import Barrage from './Barrage';
import { Dropdown, Menu, Slider } from 'antd';

interface IState {
  isStart: boolean;
  // if it's not crawling, canStart will be false
  // because no new barrages
  canStart: boolean;
}

// moveTime: the time from barrage appear to disappear
type sliderSettingType = 'moveTime' | 'fontSize' | 'opacity';

interface ISliderSetting {
  text: string;
  min: number;
  max: number;
  step?: number;
  value: number;
}

export default class BarrageWall extends Component<{}, IState> {
  private wh: number = window.innerHeight;
  private barrageWallIns: HTMLDivElement | null;
  private sliderSettings: Map<sliderSettingType, ISliderSetting> = new Map<
    sliderSettingType,
    ISliderSetting
  >([
    [
      'moveTime',
      {
        text: '弹幕飘过时间',
        min: 12,
        max: 30,
        value: 24
      }
    ],
    [
      'opacity',
      {
        text: '弹幕透明度',
        min: 0,
        max: 1,
        step: 0.1,
        value: 0.8
      }
    ],
    [
      'fontSize',
      {
        text: '弹幕字体大小',
        min: 14,
        max: 30,
        value: 22
      }
    ]
  ]);

  // the window is divided to some small area vertically which has same height
  // the barrage must be the center of a area vertically to avoid two barrages overlap

  // yIndex: the area index
  private yIndex = 1;
  // make barrages seem not too crowded
  private barrageYPadding = 8;
  // avoid barrages apppearing in the top or bottom of the page
  private noBarrageTopSize = 80;
  private noBarrageBottomSize = 100;

  constructor(props: {}) {
    super(props);

    this.state = {
      isStart: false,
      canStart: false
    };

    this.barrageWallIns = null;
  }

  componentDidMount() {
    getWebSocketClient().addSubscriber('start_crawl_success', () => {
      this.setState({
        canStart: true
      });
    });
    getWebSocketClient().addSubscriber('stop_crawl_success', () => {
      this.setState({
        canStart: false,
        isStart: false
      });
      // when crawling stops, the barrage wall should also stop
      this.stop();
    });
  }

  startHandleDmData = () => {
    getWebSocketClient().addSubscriber('cur_dm', (data: any) => {
      JSON.parse(data).forEach((item: any) => {
        this.addBarrageDom(item);
      });
    });
  };

  stopHandleDmData = () => {
    getWebSocketClient().removeSubscriber('cur_dm');
  };

  removeBarrageDom = (ins: HTMLDivElement) => {
    const parentNode = ins.parentNode as Node;
    ReactDOM.unmountComponentAtNode(ins.parentElement as Element);
    this.barrageWallIns?.removeChild(parentNode);
  };

  removeAllBarrageDom = () => {
    ReactDOM.unmountComponentAtNode(this.barrageWallIns as HTMLDivElement);
  };

  start = () => {
    this.startHandleDmData();
    getWebSocketClient().emitEvent('request_send_dm', '');
  };

  stop = () => {
    this.stopHandleDmData();
    getWebSocketClient().emitEvent('stop_send_dm', '');
    this.removeAllBarrageDom();
  };

  addBarrageDom = (item: any) => {
    const fontSize = this.sliderSettings.get('fontSize')?.value as number;
    const barrageHeight = fontSize + 2 * this.barrageYPadding;
    const barrageAreaNum = Math.floor(
      (this.wh - this.noBarrageTopSize - this.noBarrageBottomSize) / barrageHeight
    );
    const barrageYPos = this.yIndex * barrageHeight + this.noBarrageTopSize;
    // magic number 0.7...
    // just make barrages seem more average and try to avoid two barrages overlap
    this.yIndex = (this.yIndex + Math.ceil(barrageAreaNum * 0.7)) % barrageAreaNum;

    // add new barrage to the container
    const newBarrageElement = React.createElement(Barrage, {
      content: item,
      initY: barrageYPos,
      moveTime: this.sliderSettings.get('moveTime')?.value as number,
      fontSize: this.sliderSettings.get('fontSize')?.value as number,
      opacity: this.sliderSettings.get('opacity')?.value as number,
      onDisappear: this.removeBarrageDom.bind(this)
    });
    const wrapper = document.createElement('div');
    this.barrageWallIns?.appendChild(wrapper);
    ReactDOM.render(newBarrageElement, wrapper);
  };

  getSliderMenuItem = (setting: ISliderSetting) => {
    return (
      <Menu.Item key={setting.text}>
        {setting.text}
        <Slider
          min={setting.min}
          max={setting.max}
          step={setting.step ?? 1}
          defaultValue={setting.value}
          onChange={value => {
            if (typeof value === 'number') {
              setting.value = value;
            }
          }}
        />
      </Menu.Item>
    );
  };

  getSliderMenu = () => {
    const res: Array<JSX.Element> = [];
    this.sliderSettings.forEach((setting, name) => {
      res.push(this.getSliderMenuItem(setting));
    });

    return res;
  };

  render() {
    return (
      <React.Fragment>
        <Dropdown.Button
          type="primary"
          disabled={!this.state.canStart}
          style={{
            position: 'fixed',
            zIndex: 9998,
            bottom: '30px',
            right: '30px'
          }}
          onClick={e => {
            this.state.isStart ? this.stop() : this.start();
            this.setState({ isStart: !this.state.isStart });
          }}
          overlay={<Menu>{this.getSliderMenu()}</Menu>}
        >
          {this.state.isStart ? '关闭弹幕墙' : '开启弹幕墙'}
        </Dropdown.Button>
        <div
          ref={e => (this.barrageWallIns = e)}
          style={{
            display: this.state.isStart ? 'block' : 'none',
            position: 'absolute',
            zIndex: 9999,
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        ></div>
      </React.Fragment>
    );
  }
}
