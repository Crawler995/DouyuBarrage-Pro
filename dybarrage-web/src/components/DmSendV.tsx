import React, { Component } from 'react';
import { Card, Form, Switch, Row, Col, Button, message, InputNumber } from 'antd';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import color from '../uiconfig/color';
import ReactEcharts, { ObjectMap } from 'echarts-for-react';
import { graphic } from 'echarts';

interface IState {
  isOpenHighlightCaptured: boolean;
  chartOption: ObjectMap;
}

export default class DmSendV extends Component<{}, IState> {
  // if dmSendV > thresold
  // a highlight record will be saved to DB
  // throttleTime: the highlight record will be throttled
  private highlightCaptureSettings: { thresold: number; throttleTime: number };
  private tempSettings: { thresold: number; throttleTime: number };
  private throttleFlag: any = null;

  private xData = Array(120).fill('00:00:00');
  private yData = Array(120).fill(0);

  constructor(props: {}) {
    super(props);

    this.state = {
      isOpenHighlightCaptured: false,
      chartOption: {
        title: {
          text: '实时弹幕发送速度',
          x: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: color.primary
            }
          },
          formatter: `{b} 速度{c}条/s`
        },
        xAxis: {
          name: '时间',
          type: 'category',
          data: this.xData,
          boundaryGap: true,
          axisTick: {
            alignWithLabel: true,
            interval: 10
          },
          axisLabel: {
            interval: 10
          }
        },
        yAxis: {
          name: '弹幕发送速度',
          type: 'value'
        },
        series: {
          type: 'line',
          lineStyle: {
            color: color.primary
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(255, 169, 64, 0.4)'
              },
              {
                offset: 1,
                color: 'rgba(255, 169, 64, 0)'
              }
            ])
          },
          symbol: 'none'
        }
      }
    };

    // default settings
    this.highlightCaptureSettings = {
      thresold: 60,
      throttleTime: 10
    };

    this.tempSettings = { ...this.highlightCaptureSettings };
  }

  isHighlight = (obj: any) => {
    const { thresold } = this.highlightCaptureSettings;

    // last dmSendV
    const curValue = obj.dmv;
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
      const obj = JSON.parse(data);

      this.xData.shift();
      this.xData.push(obj.now);
      this.yData.shift();
      this.yData.push(obj.dmv);

      this.setState({
        chartOption: {
          series: {
            data: [...this.yData]
          },
          xAxis: {
            data: [...this.xData]
          }
        }
      });

      if (!this.state.isOpenHighlightCaptured) {
        return;
      }

      // throttle function
      if (this.throttleFlag === null && this.isHighlight(obj)) {
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
          <div
            style={{
              width: '100%',
              height: '50vh'
            }}
          >
            <ReactEcharts
              option={this.state.chartOption}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
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
              message.success('修改设置成功！');
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
