import React, { Component } from 'react';
import {
  Card,
  DatePicker,
  Form,
  Table,
  Typography,
  Button,
  Row,
  Col,
  InputNumber,
  Divider
} from 'antd';
import { getHighlightRecord } from '../network/http';
import { PaginationConfig, TableRowSelection } from 'antd/lib/table';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface IRow {
  key: string;
  time: string;
}

interface IState {
  tableData: Array<IRow>;
  selectedRowKeys: Array<string>;
  isGettingTableData: boolean;
}

export default class HighlightRecord extends Component<{}, IState> {
  private highlightRecordDataTimeRangeStrings: Array<string> = ['', ''];
  private DownloadDmSecondsAfterHighlight: number = 20;

  constructor(props: any) {
    super(props);

    this.state = {
      tableData: [],
      selectedRowKeys: [],
      isGettingTableData: false
    };
  }

  getHighlightRecordData = () => {
    this.setState({ isGettingTableData: true });
    const dateRange = this.highlightRecordDataTimeRangeStrings;

    getHighlightRecord(
      dateRange[0] === '' ? undefined : dateRange[0],
      dateRange[1] === '' ? undefined : dateRange[1],
      0,
      undefined
    )
      .then(res => {
        if (res.data.error === 0) {
          this.setState({
            tableData: res.data.data.map((item: any) => {
              return {
                key: item.id,
                time: item.time
              };
            }),
            isGettingTableData: false
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
    this.getHighlightRecordData();

    getWebSocketClient().addConnectSuccessHook(() => this.getHighlightRecordData());
  }

  renderForm = () => {
    return (
      <Card>
        <Typography.Title level={4}>筛选条件</Typography.Title>
        <Form
          layout="inline"
          onSubmit={e => {
            e.preventDefault();
            this.getHighlightRecordData();
          }}
        >
          <Form.Item label="日期范围">
            <DatePicker.RangePicker
              onChange={(dates, dateStrings) => {
                this.highlightRecordDataTimeRangeStrings = dateStrings;
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              刷新
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Typography.Title level={4}>下载高光时刻弹幕</Typography.Title>
        <Form>
          <Form.Item label="下载高光时刻开始至多少秒后的弹幕">
            <InputNumber defaultValue={this.DownloadDmSecondsAfterHighlight} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.state.selectedRowKeys.length === 0}
            >
              下载选中高光时刻弹幕
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              下载全部高光时刻弹幕
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  renderTable = () => {
    const columns = [
      {
        title: '高光时刻',
        dataIndex: 'time'
      }
    ];

    const rowSelection: TableRowSelection<unknown> = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys: any) => this.setState({ selectedRowKeys })
    };

    const pagination: PaginationConfig = {
      pageSize: 8
    };

    return (
      <Table
        rowSelection={rowSelection}
        pagination={pagination}
        columns={columns}
        dataSource={this.state.tableData}
        loading={this.state.isGettingTableData}
      />
    );
  };
  render() {
    return (
      <div>
        <Row gutter={32}>
          <Col span={12}>{this.renderForm()}</Col>

          <Col span={12}>
            <Typography.Title level={4}>抓取记录</Typography.Title>
            {this.renderTable()}
          </Col>
        </Row>
      </div>
    );
  }
}
