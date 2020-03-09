import React, { Component } from 'react';
import ReactEcharts, { ObjectMap } from 'echarts-for-react';
import color from '../uiconfig/color';
import { getDmLevelData } from '../network/http';
import { Button } from 'antd';

interface IState {
  option: ObjectMap;
  chartLoading: boolean;
}

export default class DmLevel extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      chartLoading: false,
      option: {
        title: {
          text: '弹幕发送用户等级分布',
          x: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: color.primary
            }
          }
        },
        xAxis: {
          name: '等级',
          type: 'category'
        },
        yAxis: {
          name: '发送弹幕数',
          type: 'value'
        },
        series: [
          {
            name: '弹幕发送用户等级分布',
            type: 'bar',
            itemStyle: {
              color: color.primary
            }
          },
          {
            name: '弹幕发送用户等级分布',
            type: 'pie',
            center: ['75%', '30%'],
            radius: ['0', '30%'],
            roseType: 'radius',
            itemStyle: {
              color: color.primary,
              shadowBlur: 30,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            },
            label: {
              color: 'rgba(0, 0, 0, 0.7)'
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.4)'
              },
              smooth: 0.2
            }
          }
        ]
      }
    }
  }

  getDmLevelData = () => {
    this.setState({ chartLoading: true });
    getDmLevelData()
    .then(res => {
      if(res.data.error === 0) {
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
  }

  render() {
    return (
      <div style={{
        width: '100%',
        height: 'calc(100vh - 130px)'
      }}>
        <Button onClick={() => this.getDmLevelData()}>刷新</Button>
        <ReactEcharts
          showLoading={this.state.chartLoading}
          option={this.state.option}
          style={{
            width: '100%',
            height: 'calc(100vh - 130px)'
          }}
        />
      </div>
    )
  }
}
