import React from 'react';
import ManuallyRefreshChart from './ManuallyRefreshChart';
import { getDmLevelData } from '../network/http';
import color from '../uiconfig/color';

export default function DmLevel() {
  return (
    <ManuallyRefreshChart
      initOption={{
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
      }}
      dataFn={getDmLevelData}
    />
  );
}
