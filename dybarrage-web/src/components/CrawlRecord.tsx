import React, { Component } from 'react';
import { Card, DatePicker, Form, Table, Typography, Button } from 'antd';
import { getCrawlRecord } from '../network/http';
import { TableRowSelection, PaginationConfig } from 'antd/lib/table';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface IRow {
  key: string;
  crawlStartTime: string;
  crawlStopTime: string;
  crawlDmNum: number;
}

interface IState {
  tableData: Array<IRow>;
  selectedRowKeys: Array<string>;
  pagination: PaginationConfig;
  isGettingTableData: boolean;
}

export default class CrawlRecord extends Component<{}, IState> {
  private crawlRecordDataTimeRangeStrings: Array<string>;
  private crawlRecordPageSize = 5;

  constructor(props: any) {
    super(props);

    this.state = {
      tableData: [],
      selectedRowKeys: [],
      pagination: {
        pageSize: this.crawlRecordPageSize
      },
      isGettingTableData: false
    };

    this.crawlRecordDataTimeRangeStrings = ['', ''];
  }

  handleTableChange = (pagination: PaginationConfig) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });

    if (typeof pagination.current === 'number') {
      this.getCrawlRecordData((pagination.current - 1) * this.crawlRecordPageSize);
    }
  };

  getCrawlRecordData = (offset: number = 0, limit: number = this.crawlRecordPageSize) => {
    this.setState({ isGettingTableData: true });
    const dateRange = this.crawlRecordDataTimeRangeStrings;

    getCrawlRecord(
      dateRange[0] === '' ? undefined : dateRange[0],
      dateRange[1] === '' ? undefined : dateRange[1],
      offset,
      limit
    )
      .then(res => {
        if (res.data.error === 0) {
          const pagination = { ...this.state.pagination };
          pagination.total = res.data.total;
          this.setState({
            tableData: res.data.data.map((item: any) => {
              return {
                key: item.id,
                crawlStartTime: item.start_time,
                crawlStopTime: item.stop_time,
                crawlDmNum: item.dm_num
              };
            }),
            isGettingTableData: false,
            pagination
          });
        }
      })
      .catch(err => {
        this.setState({
          isGettingTableData: false
        });
        console.log(err);
      });
  };

  componentDidMount() {
    this.getCrawlRecordData();

    getWebSocketClient().addConnectSuccessHook(() => this.getCrawlRecordData());
  }

  renderForm = () => {
    return (
      <Card style={{ marginBottom: '30px' }}>
        <Form
          layout="inline"
          onSubmit={e => {
            e.preventDefault();
            this.getCrawlRecordData();
          }}
        >
          <Form.Item label="日期范围">
            <DatePicker.RangePicker
              onChange={(dates, dateStrings) => {
                this.crawlRecordDataTimeRangeStrings = dateStrings;
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              刷新
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  renderTable = () => {
    const columns = [
      {
        title: '抓取开始时间',
        dataIndex: 'crawlStartTime',
        sorter: (r1: IRow, r2: IRow) => (r1.crawlStartTime > r2.crawlStartTime ? 1 : -1)
      },
      {
        title: '抓取结束时间',
        dataIndex: 'crawlStopTime'
      },
      {
        title: '抓取弹幕数',
        dataIndex: 'crawlDmNum',
        sorter: (r1: IRow, r2: IRow) => r1.crawlDmNum - r2.crawlDmNum
      }
    ];

    const rowSelection: TableRowSelection<unknown> = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys: any) => this.setState({ selectedRowKeys })
    };

    return (
      <Table
        rowSelection={rowSelection}
        pagination={this.state.pagination}
        columns={columns}
        dataSource={this.state.tableData}
        loading={this.state.isGettingTableData}
        onChange={this.handleTableChange}
      />
    );
  };
  render() {
    return (
      <div>
        <Typography.Title level={4}>筛选条件</Typography.Title>
        {this.renderForm()}

        <Typography.Title level={4}>抓取记录</Typography.Title>
        <Button
          type="primary"
          style={{ marginBottom: '10px', marginRight: '10px' }}
          disabled={this.state.selectedRowKeys.length === 0}
        >
          下载选中弹幕
        </Button>
        <Button type="primary" style={{ marginBottom: '10px' }}>
          下载全部弹幕
        </Button>
        {this.renderTable()}
      </div>
    );
  }
}
