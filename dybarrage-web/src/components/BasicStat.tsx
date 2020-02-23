import React, { Component } from 'react';
import { Statistic, Row, Col, Card, Tag, PageHeader, Typography, Divider, Spin, Modal, Input, Button, message } from "antd";
import { getRoomDyInfo } from '../network/http';
import getWebSocketClient from '../network/websocket';


interface IStatistic {
  title: string,
  value: number | string
}

interface IRoomDyInfo {
  avatarUrl: string,
  owner: string,
  roomTitle: string,
  cateName: string,
  isOnline: boolean,
  hot?: number,
  startTime?: string
}

interface IState {
  statData: Array<IStatistic>,
  roomDyInfo: IRoomDyInfo,
  noThisRoom: boolean,
  isStartCrawling: boolean,
  isWSConnected: boolean
}

export default class BasicStat extends Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      statData: [],
      roomDyInfo: {
        avatarUrl: '',
        roomTitle: '',
        owner: '',
        cateName: '',
        isOnline: false
      },
      noThisRoom: false,
      isStartCrawling: false,
      isWSConnected: false
    }
  }

  updateStatistic = (data: any) => {
    this.setState({ statData: JSON.parse(data), isWSConnected: true });
  }

  getRoomDyInfo = () => {
    getRoomDyInfo()
    .then(res => {
      if(res.data.error === 0) {
        const data: any = res.data.data;
        const roomDyInfo: IRoomDyInfo = {
          avatarUrl: data.avatar,
          roomTitle: data.room_name,
          owner: data.owner_name,
          cateName: data.cate_name,
          startTime: data.start_time,
          hot: data.hn,
          isOnline: data.room_status === '1'
        };

        this.setState({ roomDyInfo });
      }
    })
    .catch(err => {
      if(err.response.status === 404) {
        this.setState({ noThisRoom: true });
      } else if(err.response.status === 500) {
        message.error('无互联网连接，无法获取房间信息！');
      }
    });

    console.log('get dy')
  }

  componentDidMount() {
    // subscribe the event
    // when server sends data to client, the callback fn will be invoked
    getWebSocketClient().addSubscriber('CRAWL_BASIC_STAT', this.updateStatistic.bind(this));
    getWebSocketClient().addSubscriber('serverclose', () => {
      this.setState({ isStartCrawling: false, isWSConnected: false });
    });
    getWebSocketClient().addNeedWaitServerStartFn(this.getRoomDyInfo.bind(this));

    this.getRoomDyInfo();
  }

  renderStatistic = () => {
    return (
      this.state.statData.length !== 0 ?
      <Row gutter={[16, 16]}>
      {
        this.state.statData.map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))
      }
      </Row> :
      <Spin />
    );
  }

  renderRoomDyInfo = () => {
    const { owner, roomTitle, avatarUrl, cateName, isOnline, hot, startTime } = this.state.roomDyInfo;
    return (
      roomTitle !== '' ?
      <PageHeader
        title={owner}
        subTitle={roomTitle}
        avatar={{ src: avatarUrl }}
        tags={
          [
            <Tag color="orange" key={0}>{isOnline ? '正在直播' : '未开播'}</Tag>,
            <Tag color="orange" key={1}>{cateName}</Tag>
          ].concat(isOnline ?
          [
            <Tag color="red" key={2}>{`热度：${hot}`}</Tag>,
            <Tag color="orange" key={3}>{`开播时间：${startTime}`}</Tag>
          ] :
          [
            <Tag color="orange" key={2}>{`上次开播时间：${startTime}`}</Tag>
          ])
        }
        extra={
          [
            <Button
              key={0}
              type="primary" 
              disabled={!this.state.isWSConnected || this.state.isStartCrawling}
              onClick={() => {
                getWebSocketClient().emitEvent('startcrawl', '');
                message.success('开始抓取！');
                this.setState({ isStartCrawling: true });
              }}
            >开始抓取</Button>,
            <Button
              key={1}
              type="primary" 
              disabled={!this.state.isStartCrawling}
              onClick={() => {
                getWebSocketClient().emitEvent('stopcrawl', '');
                message.success('已停止抓取！')
                this.setState({ isStartCrawling: false });
              }}
            >停止抓取</Button>
          ]
        }
      /> :
      <Spin />
    );
  }

  // if this room is not existed in Douyu
  // the modal will appear to force user to re-select room
  renderNoThisRoomModal = () => {
    return (
      <Modal
        visible={this.state.noThisRoom}
        closable={false}
        footer={null}
        title="房间未找到"
      >
        <p>斗鱼没有此房间！请检查并在下方输入正确的房间号，回车确认。</p>
        <Input.Search
          placeholder="房间号"
          enterButton
          style={{ width: '300px' }}
          onSearch={value => window.location.href = `http://localhost:3000?roomid=${value}`}
        />
      </Modal>
    );
  }

  render() {
    return (
      <div>
        { this.renderNoThisRoomModal() }

        <Typography.Title level={4}>主播基本情况</Typography.Title>
        { this.renderRoomDyInfo() }
        <Divider />

        <Typography.Title level={4}>弹幕基本情况</Typography.Title>
        { this.renderStatistic() }
      </div>
    )
  }
}
