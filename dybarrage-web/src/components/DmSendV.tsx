import React, { Component } from 'react';
import Chart from './Chart';
import { Card, Form, Switch, Row, Col, Button, message, InputNumber } from 'antd';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface IState {
  isOpenHighlightCaptured: boolean;
}

export default class DmSendV extends Component<{}, IState> {
  // if dmSendV > thresold
  // a highlight record will be saved to DB
  // throttleTime: the highlight record will be throttled
  private highlightCaptureSettings: { thresold: number; throttleTime: number };
  private tempSettings: { thresold: number; throttleTime: number };
  private throttleFlag: any = null;

  constructor(props: {}) {
    super(props);

    this.state = {
      isOpenHighlightCaptured: false
    };

    // default settings
    this.highlightCaptureSettings = {
      thresold: 8,
      throttleTime: 5
    };

    this.tempSettings = { ...this.highlightCaptureSettings };
  }

  isHighlight = (data: any) => {
    const { thresold } = this.highlightCaptureSettings;
    const obj = JSON.parse(data);
    if (obj.series.data === undefined) {
      return;
    }
    const arr = obj.series.data as Array<number>;
    // last dmSendV
    const curValue = arr[arr.length - 1];
    return curValue > thresold;
  };

  captureHighlight = () => {
    message.success('捕捉到高光时刻！');
    // todo
    // emit server to add a record to db
    getWebSocketClient().emitEvent('add_highlight_record', '');
  };

  startHandleDmSendVData = () => {
    getWebSocketClient().addSubscriber('dmsendv_data', (data: any) => {
      if (!this.state.isOpenHighlightCaptured) {
        return;
      }

      // throttle function
      if (this.throttleFlag === null && this.isHighlight(data)) {
        this.captureHighlight();
        this.throttleFlag = setTimeout(() => {
          clearTimeout(this.throttleFlag);
          this.throttleFlag = null;
        }, this.highlightCaptureSettings.throttleTime * 1000);
      }
    });
  };

  componentDidMount() {
    this.startHandleDmSendVData();
  }

  render() {
    const { throttleTime, thresold } = this.highlightCaptureSettings;
    const disabled = !this.state.isOpenHighlightCaptured;

    return (
      <div>
        <Card>
          <Chart
            dataEventId="dmsendv_data"
            style={{
              width: '100%',
              height: '50vh'
            }}
          />
        </Card>
        <Card
          style={{
            marginTop: '20px'
          }}
        >
          <Form
            layout="inline"
            onSubmit={e => {
              e.preventDefault();
              this.highlightCaptureSettings = { ...this.tempSettings };
            }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="打开高光时刻自动捕捉">
                  <Switch
                    onChange={() => {
                      this.setState({
                        isOpenHighlightCaptured: !this.state.isOpenHighlightCaptured
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="阈值">
                  <InputNumber
                    min={1}
                    step={1}
                    defaultValue={thresold}
                    disabled={disabled}
                    onChange={value => {
                      if (typeof value == 'number') {
                        this.tempSettings.thresold = value;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="节流">
                  <InputNumber
                    min={2}
                    step={1}
                    defaultValue={throttleTime}
                    disabled={disabled}
                    onChange={value => {
                      if (typeof value == 'number') {
                        this.tempSettings.throttleTime = value;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" disabled={disabled}>
                    确定
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>根据弹幕发送速度来判断高光时刻。</Col>
              <Col span={6}>当弹幕发送速度超过设定阈值时，自动记录高光时刻。</Col>
              <Col span={8}>
                如果连续10s的弹幕发送速度都超过了阈值，
                在不设置节流的情况下，这10秒都会被计入高光时刻，而这是不必要的。
                如果将节流设置为6s，代表两次高光时刻最少间隔6s，
                意味着上述情况下将只会记录两次高光时刻（第1s，第7s）。
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    );
  }
}
