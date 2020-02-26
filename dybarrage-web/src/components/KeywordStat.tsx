import React, { Component } from 'react';
import { Card, Input, Typography, Table, Button, message } from 'antd';
import { PaginationConfig } from 'antd/lib/table';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface IRow {
  key: string
  keyword: string,
  totalMatchNum: number,
  thisCrawlMatchNum: number
}

interface IState {
  tableData: Array<IRow>,
  isAddedRoomSuccess: boolean
}

export default class KeywordStat extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      tableData: [],
      isAddedRoomSuccess: false
    }
  }

  subscribeEvents = () => {
    const ws = getWebSocketClient();
    ws.addSubscriber('add_keyword_success', () => message.success('添加关键词成功！'));
    ws.addSubscriber('add_keyword_failed', (error) => message.error(error));
    ws.addSubscriber('delete_keyword_success', () => message.success('删除关键词成功！'));
    ws.addSubscriber('delete_keyword_failed', (error) => message.error(error));

    ws.addSubscriber('keyword_stat', (data: any) => this.setState({ tableData: JSON.parse(data) }));

    ws.addConnectSuccessHook(() => this.setState({ isAddedRoomSuccess: true }));
    ws.addConnectErrorHook(() => this.setState({ isAddedRoomSuccess: false }));
  }

  componentDidMount() {
    this.subscribeEvents();
  }

  addKeyword = (keyword: string) => {
    if(this.state.tableData.map(item => item.keyword).includes(keyword)) {
      return;
    }
    if(keyword.trim() === '') {
      return;
    }

    getWebSocketClient().emitEvent('add_keyword', keyword);
  }

  deleteKeyword = (keyword: string) => {
    getWebSocketClient().emitEvent('delete_keyword', keyword);
  }

  renderInput = () => {
    return (
      <Card style={{ marginBottom: '30px' }}>
        <Input.Search
          placeholder="输入后回车添加关键词"
          enterButton
          disabled={!this.state.isAddedRoomSuccess}
          style={{ width: '300px' }}
          onSearch={value => this.addKeyword(value)}
        />
      </Card>
    )
  }

  renderTable = () => {
    const columns = [
      {
        title: '关键词',
        dataIndex: 'keyword'
      },
      {
        title: '总出现数量',
        dataIndex: 'totalMatchNum'
      },
      {
        title: '此次出现数量',
        dataIndex: 'thisCrawlMatchNum'
      },
      {
        title: '删除关键词',
        dataIndex: 'deleteKeyword',
        render: (text: any, record: any) => 
          <Button
            disabled={!this.state.isAddedRoomSuccess}
            onClick={() => this.deleteKeyword(record.key)}
          >
            删除
          </Button>
      }
    ];

    const pagination: PaginationConfig = {
      pageSize: 6
    };
    
    return (
      <Table
        pagination={pagination}
        columns={columns}
        dataSource={this.state.tableData}
      />
    )
  }

  render() {
    return (
      <div>
        <Typography.Title level={4}>添加关键词</Typography.Title>
        { this.renderInput() }

        <Typography.Title level={4}>关键词统计</Typography.Title>
        { this.renderTable() }
      </div>
    )
  }
}
