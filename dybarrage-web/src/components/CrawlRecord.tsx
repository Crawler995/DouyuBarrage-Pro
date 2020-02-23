import React, { Component } from 'react';
import { Card, DatePicker, Form, Table, Typography, Button } from 'antd';

interface IRow {
  key: string,
  crawlStartTime: string,
  crawlStopTime: string,
  crawlDmNum: number,
  dmDownload: string
}

interface IState {
  tableData: Array<IRow>
}

export default class CrawlRecord extends Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      tableData: []
    }
  }

  componentDidMount() {
    const tableData: Array<IRow> = [
      { 
        key: '0',
        crawlStartTime: '2000-08-08 11:20:33',
        crawlStopTime: '2000-08-08 11:20:33',
        crawlDmNum: 123,
        dmDownload: ''
      },
      { 
        key: '1',
        crawlStartTime: '2000-08-08 11:20:33',
        crawlStopTime: '2000-08-08 11:20:33',
        crawlDmNum: 123,
        dmDownload: ''
      }
    ];

    this.setState({ tableData });
  }
  renderForm = () => {
    return (
      <Card style={{ marginBottom: '30px' }}>
        <Form layout="inline">
          <Form.Item label="日期范围">
            <DatePicker.RangePicker />
          </Form.Item>
        </Form>
      </Card>
    )
  }

  renderTable = () => {
    const columns = [
      {
        title: '抓取开始时间',
        dataIndex: 'crawlStartTime',
        sorter: true
      },
      {
        title: '抓取结束时间',
        dataIndex: 'crawlStopTime'
      },
      {
        title: '抓取弹幕数',
        dataIndex: 'crawlDmNum',
        sorter: true
      },
      {
        title: '下载弹幕',
        dataIndex: 'dmDownload',
        render: (dmdownload: string) => <Button type="primary" size="small">下载</Button>
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={this.state.tableData}
      />
    )
  }
  render() {
    return (
      <div>
        <Typography.Title level={4}>筛选条件</Typography.Title>
        { this.renderForm() }

        <Typography.Title level={4}>抓取记录</Typography.Title>
        { this.renderTable() }
      </div>
    )
  }
}
