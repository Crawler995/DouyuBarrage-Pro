import React from 'react';
import ManuallyRefreshChart from './ManuallyRefreshChart';
import { getFansData } from '../network/http';
import color from '../uiconfig/color';

export default function FansChart() {
  return (
    <ManuallyRefreshChart
      initOption={{
        title: {
          text: '粉丝发送弹幕排行',
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
          name: '名字',
          type: 'category'
        },
        yAxis: {
          name: '发送弹幕数',
          type: 'value'
        },
        series: {
          name: '发送弹幕数',
          type: 'bar',
          itemStyle: {
            color: color.primary
          }
        }
      }}
      dataFn={getFansData}
    />
  );
}
