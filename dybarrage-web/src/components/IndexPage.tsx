import React, { useState, useEffect } from 'react';
import { Input, Divider, Card, Spin, Row, Col } from 'antd';
import color from '../uiconfig/color';
import { getTop3 } from '../network/http';

export default function IndexPage() {
  const [topData, setTopData] = useState([] as any[]);

  const getTopData = async () => {
    try {
      const res = await getTop3();
      if (res.data.error === 0) {
        const data = (res.data.data as Array<any>).slice(0, 12);
        setTopData(data);
      } else {
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTopData();
  }, []);

  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'absolute',
        width: '100%',
        height: '100%',
        padding: '0 15vw 5vh 15vw',
        textAlign: 'center',
        overflowX: 'hidden'
      }}
    >
      <div
        style={{
          padding: '6vh 0'
        }}
      >
        <h1
          style={{
            color: color.primary
          }}
        >
          斗鱼弹幕管理中心入口
        </h1>
        <h2>输入房间号回车</h2>

        <Input.Search
          placeholder="房间号"
          enterButton
          style={{ width: '300px' }}
          onSearch={value => (window.location.href = `http://localhost:3000/basic?roomid=${value}`)}
        />
      </div>

      <Divider />

      <h2>点击卡片可快速跳转</h2>

      {topData.length === 0 ? (
        <Spin />
      ) : (
        <Row gutter={[32, 32]}>
          {
            topData.map((item: any) =>
              <Col span={8}>
              <Card
                hoverable
                onClick={() =>
                  (window.location.href = `http://localhost:3000/basic?roomid=${item.room_id}`)
                }
                cover={<img alt="preview" src={item.room_src} />}
              >
                <Card.Meta title={item.nickname} description={item.room_name} />
              </Card>
              </Col>
            )
          }
        </Row>
      )}
    </div>
  );
}
