import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';

import { Layout, Icon, message } from 'antd';

import AppMain from './components/AppMain';
import color from './uiconfig/color';
import getRoomId from './util/getRoomId';
import getWebSocketClient from './network/websocket/WebSocketClient';
import IndexPage from './components/IndexPage';

const { Header, Content } = Layout;

class App extends React.Component {
  private roomId: string;
  constructor(props: {}) {
    super(props);

    this.roomId = getRoomId();
  }

  componentDidMount() {
    if (this.roomId !== '' && window.location.pathname !== '/') {
      getWebSocketClient().addConnectSuccessHook(() => message.success('连接服务器成功！'));
      getWebSocketClient().addConnectErrorHook(() => message.error('连接服务器失败！'));
    }
  }

  render() {
    if (this.roomId === '') {
      return <IndexPage />;
    }
    return (
      <Layout>
        <Header
          style={{
            position: 'relative',
            zIndex: 10,
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px #f0f1f2'
          }}
        >
          <div style={{ float: 'left', fontSize: '18px', color: '#000' }}>
            <Icon
              type="home"
              style={{ marginRight: '8px', fontSize: '18px', color: color.primary }}
            />
            斗鱼弹幕抓取管理中心
          </div>
          <div style={{ float: 'right', fontSize: '16px', color: '#000' }}>
            <Icon type="github" style={{ marginRight: '6px', fontSize: '16px' }} />
            <a href="https://github.com/Crawler995/" target="_blank" rel="noopener noreferrer">
              Crawler995
            </a>
          </div>
        </Header>

        <Content style={{ background: '#fff' }}>
          <Layout style={{ background: '#fff' }}>
            <BrowserRouter>
              <AppMain />
            </BrowserRouter>
          </Layout>
        </Content>
      </Layout>
    );
  }
}

export default App;
