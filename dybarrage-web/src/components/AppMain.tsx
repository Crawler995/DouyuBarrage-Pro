import React from 'react';
import { Route } from 'react-router-dom';

import { Layout } from 'antd';
import AppMenu from './AppMenu';
import BasicStat from './BasicStat';
import CrawlRecord from './CrawlRecord';
const { Content, Sider } = Layout;

const AppMain: React.SFC = () => {
  return (
    <Layout>
      <Sider width={250} style={{ background: '#fff' }}>
        <AppMenu />
      </Sider>

      <Content style={{ 
        padding: '30px', 
        minHeight: `${window.innerHeight - 64}px`, 
        background: '#fff' 
      }}>
        <Route exact path="/" component={BasicStat} />
        <Route exact path="/basic" component={BasicStat} />
        <Route exact path="/crawlrec" component={CrawlRecord} />
      </Content>
    </Layout>
  );
}

export default AppMain;