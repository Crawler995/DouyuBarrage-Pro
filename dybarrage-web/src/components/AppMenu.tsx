import React from 'react';
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Menu, Icon } from 'antd';
import getRoomId from '../util/getRoomId';

interface IItem {
  text: string,
  path: string
}

interface ISubMenu {
  title: string,
  iconType: string,
  items: Array<IItem>
}

interface IMenu {
  subMenus: Array<ISubMenu>
}

const menu: IMenu = {
  subMenus: [
    {
      title: '数据统计',
      iconType: 'file-text',
      items: [
        { text: '概览', path: 'basic' },
        { text: '抓取记录及弹幕下载', path: 'crawlrec' },
        { text: '高频弹幕', path: 'mostdm' },
        { text: '铁粉统计', path: 'fansstat' }
      ]
    },
    {
      title: '图表查看',
      iconType: 'area-chart',
      items: [
        { text: '实时弹幕发送速度', path: 'dmsendv' },
        { text: '用户等级与发送弹幕数', path: 'dmlevel' },
        { text: '弹幕词云', path: 'dmcloud' }
      ]
    }
  ]
};

const getSubMenuKey = (index: number) => `sub${index}`;

const AppMenu: React.SFC<RouteComponentProps> = (props) => {
  // defaultSelectedKey depends on the url
  let defaultSelectedKey = props.location.pathname.split('/')[1];
  defaultSelectedKey = defaultSelectedKey === '' ? 'basic' : defaultSelectedKey;

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={[defaultSelectedKey]}
      defaultOpenKeys={[0, 1].map(i => getSubMenuKey(i))}
      style={{ height: '100%' }}
    >
      {
        menu.subMenus.map((subMenu, subIndex) => 
          <Menu.SubMenu
            key={getSubMenuKey(subIndex)}
            title={
              <span>
                <Icon type={subMenu.iconType} />
                {subMenu.title}
              </span>
            }
          >
            {
              subMenu.items.map((item, itemIndex) => 
                <Menu.Item key={item.path}>
                  <Link to={`/${item.path}?roomid=${getRoomId()}`}>{item.text}</Link>
                </Menu.Item>
              )
            }
          </Menu.SubMenu>
        )
      }
    </Menu>
  );
}

export default withRouter(AppMenu);