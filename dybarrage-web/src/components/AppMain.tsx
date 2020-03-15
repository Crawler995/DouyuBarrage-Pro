import React from 'react';
import { Route } from 'react-router-dom';

import { Layout } from 'antd';
import AppMenu from './AppMenu';
import BasicStat from './BasicStat';
import CrawlRecord from './CrawlRecord';
import getRoomId from '../util/getRoomId';
import KeywordStat from './KeywordStat';
import DmSendV from './DmSendV';
import BarrageWall from './BarrageWall';
import HighlightRecord from './HighlightRecord';
import BarrageWordCloud from './BarrageWordCloud';
import FansChart from './FansChart';
const { Content, Sider } = Layout;

const noUnmountedWhenRouteChangesRoute = (path: string, component: JSX.Element) => {
  return (
    <Route
      exact
      path={path}
      children={props => {
        // '/' redirects to '/basic'
        if (props.location.pathname === '/') {
          window.location.href = `http://localhost:3000/basic?roomid=${getRoomId()}`;
          return <div></div>;
        }
        return (
          <div
            style={{
              display: props.location.pathname === path ? 'block' : 'none'
            }}
          >
            {component}
          </div>
        );
      }}
    />
  );
};

const AppMain: React.SFC = () => {
  return (
    <Layout>
      <BarrageWall />

      <Sider width={250} style={{ background: '#fff' }}>
        <AppMenu />
      </Sider>

      <Content
        style={{
          padding: '30px',
          minHeight: `${window.innerHeight - 66}px`,
          background: '#fff'
        }}
      >
        {noUnmountedWhenRouteChangesRoute('/basic', <BasicStat />)}
        {noUnmountedWhenRouteChangesRoute('/crawlrec', <CrawlRecord />)}
        {noUnmountedWhenRouteChangesRoute('/keywordstat', <KeywordStat />)}
        {noUnmountedWhenRouteChangesRoute('/highlightrec', <HighlightRecord />)}

        {noUnmountedWhenRouteChangesRoute('/dmsendv', <DmSendV />)}
        {noUnmountedWhenRouteChangesRoute('/dmcloud', <BarrageWordCloud />)}
        {noUnmountedWhenRouteChangesRoute('/fanstat', <FansChart />)}
      </Content>
    </Layout>
  );
};

export default AppMain;
