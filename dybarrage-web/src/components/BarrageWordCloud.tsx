import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-wordcloud';
import { Button } from 'antd';
import { getWordFrequency } from '../network/http';
import getWebSocketClient from '../network/websocket/WebSocketClient';

export default class BarrageWordCloud extends Component {
  private chartIns: echarts.ECharts | null = null;

  componentDidMount() {
    this.chartIns = echarts.init(document.getElementById('barrage-word-cloud') as HTMLDivElement);
    getWebSocketClient().addConnectSuccessHook(() => this.getWordFrequency());
  }

  getWordFrequency = () => {
    this.chartIns?.showLoading();
    getWordFrequency()
      .then(res => {
        if (res.data.error === 0) {
          const data = res.data.data;
          (this.chartIns as any).setOption({
            series: [
              {
                type: 'wordCloud',
                shape: 'circle',
                textStyle: {
                  normal: {
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    color: function() {
                      return (
                        'rgb(' +
                        [
                          Math.round(Math.random() * 160),
                          Math.round(Math.random() * 160),
                          Math.round(Math.random() * 160)
                        ].join(',') +
                        ')'
                      );
                    }
                  }
                },
                data
              }
            ]
          });
          this.chartIns?.hideLoading();
        }
      })
      .catch(err => {
        console.log(err);
        this.chartIns?.hideLoading();
      });
  };

  render() {
    return (
      <div
        style={{
          width: 'calc(100vw - 200px)'
        }}
      >
        <Button onClick={() => this.getWordFrequency()}>刷新</Button>

        <div id="barrage-word-cloud" style={{ width: 'calc(100vw - 300px)', height: 'calc(100vh - 200px)' }} />
      </div>
    );
  }
}
