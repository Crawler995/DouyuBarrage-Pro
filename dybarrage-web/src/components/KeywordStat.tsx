import React, { Component } from 'react';
import { Card, Input, Typography, Table, Button } from 'antd';
import { PaginationConfig } from 'antd/lib/table';

interface IRow {
  key: string
  keyword: string,
  totalMatchNum: number,
  thisCrawlMatchNum: number
}

interface IState {
  tableData: Array<IRow>
}

export default class KeywordStat extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      tableData: []
    }
  }

  addKeyword = (keyword: string) => {
    if(this.state.tableData.map(item => item.keyword).includes(keyword)) {
      return;
    }

    const {tableData} = this.state;
    tableData.push({
      key: keyword,
      keyword,
      totalMatchNum: 0,
      thisCrawlMatchNum: 0
    });
    this.setState({ tableData });
  }

  deleteKeyword = (keyword: string) => {
    const {tableData} = this.state;
    this.setState({
      tableData: tableData.filter(item => item.keyword !== keyword)
    });
  }

  renderInput = () => {
    return (
      <Card style={{ marginBottom: '30px' }}>
        <Input.Search
          placeholder="输入后回车添加关键词"
          enterButton
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
        title: '总匹配数量',
        dataIndex: 'totalMatchNum'
      },
      {
        title: '此次匹配数量',
        dataIndex: 'thisCrawlMatchNum'
      },
      {
        title: '删除关键词',
        dataIndex: 'deleteKeyword',
        render: (text: any, record: any) => 
          <Button
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
