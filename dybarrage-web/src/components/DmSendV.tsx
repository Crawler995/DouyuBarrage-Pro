import React, { Component } from 'react';
import { Row, Col, List, Avatar, Tag } from 'antd';
import Chart from './Chart';
import getWebSocketClient from '../network/websocket/WebSocketClient';

interface BarrageInfo {
  senderName: string;
  senderLevel: number;
  senderAvatarUrl: string;
  badgeName: string | null;
  badgeLevel: number | null;
  content: string;
}

interface IState {
  lastSecBarrages: Array<BarrageInfo>;
}

export default class DmSendV extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      lastSecBarrages: []
    };
  }

  subscribeEvents = () => {
    getWebSocketClient().addSubscriber('lastsec_dm', (data: any) => {
      this.setState({
        lastSecBarrages: JSON.parse(data).map((item: any) => {
          return {
            senderName: item.sender_name,
            senderLevel: item.sender_level,
            senderAvatarUrl: item.sender_avatar_url,
            badgeName: item.badge_name,
            badgeLevel: item.badge_level,
            content: item.dm_content
          };
        })
      });

      console.log(this.state);
    });
  };

  componentDidMount() {
    this.subscribeEvents();
  }

  render() {
    return (
      <Row>
        <Col span={18}>
          <Chart dataEventId="dmsendv_data" />
        </Col>
        <Col span={6}>
          <List
            dataSource={this.state.lastSecBarrages}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={`https://apic.douyucdn.cn/upload/${item.senderAvatarUrl}_middle.jpg`}
                    />
                  }
                  title={
                    <span>
                      <Tag color="orange">{item.senderLevel + '级'}</Tag>
                      {item.badgeName !== null ? (
                        <Tag color="gold">{`${item.badgeName} ${item.badgeLevel}`}</Tag>
                      ) : (
                        <span></span>
                      )}
                      <span>{item.senderName}</span>
                    </span>
                  }
                  description={item.content}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    );
  }
}
