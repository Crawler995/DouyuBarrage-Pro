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
import { getHighlightRecord, downloadBarragesByHighlightRecord } from '../network/http';
import { PaginationConfig, TableRowSelection } from 'antd/lib/table';
import getWebSocketClient from '../network/websocket/WebSocketClient';
import BarrageDownloadCheckBox, { barragesFileDefaultColumns } from './BarrageDownloadCheckBox';
import downloadFile from '../util/downloadFile';

interface IRow {
  key: string;
  time: string;
}

interface IState {
  tableData: Array<IRow>;
  pagination: PaginationConfig;
  selectedRowKeys: Array<number>;
  isGettingTableData: boolean;
}

export default class HighlightRecord extends Component<{}, IState> {
  private highlightRecordDataTimeRangeStrings: Array<string> = ['', ''];
  private downloadBarrageColumns: Array<string> = barragesFileDefaultColumns;
  private downloadDmSecondsAfterHighlight: number = 20;
  private highlightRecordPageSize: number = 8;

  constructor(props: any) {
    super(props);

    this.state = {
      tableData: [],
      pagination: {
        pageSize: this.highlightRecordPageSize
      },
      selectedRowKeys: [],
      isGettingTableData: false
    };
  }

  handleTableChange = (pagination: PaginationConfig) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });

    if (typeof pagination.current === 'number') {
      this.getHighlightRecordData((pagination.current - 1) * this.highlightRecordPageSize);
    }
  };

  getHighlightRecordData = (offset: number = 0, limit: number = this.highlightRecordPageSize) => {
    this.setState({ isGettingTableData: true });
    const dateRange = this.highlightRecordDataTimeRangeStrings;

    getHighlightRecord(
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
                time: item.time
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
    this.getHighlightRecordData();

    getWebSocketClient().addConnectSuccessHook(() => this.getHighlightRecordData());
  }

  downloadBarrages = (downloadSelectedBarrages: boolean) => {
    downloadBarragesByHighlightRecord(
      this.downloadBarrageColumns,
      this.downloadDmSecondsAfterHighlight,
      downloadSelectedBarrages ? this.state.selectedRowKeys : []
    )
      .then(res => {
        downloadFile(res.data, 'highlight_barrages.csv');
      })
      .catch(err => {
        console.log(err);
      });
  };

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

        <Typography.Title level={4}>下载高光时刻弹幕（CSV格式）</Typography.Title>
        <Form>
          <Form.Item label="下载高光时刻开始至多少秒后的弹幕">
            <InputNumber
              defaultValue={this.downloadDmSecondsAfterHighlight}
              onChange={value => {
                if (value !== undefined) {
                  this.downloadDmSecondsAfterHighlight = value;
                }
              }}
            />
          </Form.Item>
          <Form.Item label="选择CSV包含的列">
            <BarrageDownloadCheckBox
              onChange={checkedValue =>
                (this.downloadBarrageColumns = checkedValue as Array<string>)
              }
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.state.selectedRowKeys.length === 0}
              onClick={() => this.downloadBarrages(true)}
            >
              下载选中高光时刻弹幕
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={() => this.downloadBarrages(false)}>
              下载全部高光时刻弹幕
            </Button>
          </Form.Item>
        </Form>
        <div>
          你可以在<b>实时弹幕发送速度</b>面板中开启高光时刻自动捕获。
        </div>
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
