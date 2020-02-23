import React from 'react';
import { BrowserRouter } from "react-router-dom";
import './App.css';

import { Layout, Icon, Result, Input } from 'antd';

import AppMain from "./components/AppMain";
import color from './uiconfig/color';
import getRoomId from './util/getRoomId';

const { Header, Content } = Layout;

class App extends React.Component {
  private roomId: string;
  constructor(props: {}) {
    super(props);

    this.roomId = getRoomId();
  }

  render() {
    if(this.roomId === '') {
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          lineHeight: '50%'
        }}>
          <Result
            icon={<Icon type="plus-circle" theme="twoTone" twoToneColor={color.primary} />}
            title="指定一个房间吧！"
            subTitle="在下方输入房间号后回车确认，进入管理中心"
            extra={
              <Input.Search
                placeholder="房间号"
                enterButton
                style={{ width: '300px' }}
                onSearch={value => window.location.href = `http://localhost:3000?roomid=${value}`}
              />
            }
          />
        </div>
      );
    }
    return (
      <Layout>
        <Header>
          <div style={{ float: 'left', fontSize: '18px', color: '#fff' }}>
            <Icon type="home" style={{ marginRight: '8px', fontSize: '18px', color: color.primary }} />
            斗鱼弹幕抓取管理中心
          </div>
          <div style={{ float: 'right', fontSize: '16px', color: '#fff' }}>
            <Icon type="github" style={{ marginRight: '6px', fontSize: '16px' }} />
            <a
              href="https://github.com/Crawler995/"
              target="_blank"
              rel="noopener noreferrer"
            >Crawler995</a>
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
