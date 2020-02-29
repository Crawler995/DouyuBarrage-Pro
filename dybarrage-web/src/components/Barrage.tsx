import React from 'react';
import { Avatar } from 'antd';
import '../App.css';

interface IProps {
  initY: number;
  moveTime: number;
  content: string;
  avatarUrl: string;
  fontSize: number;
  showAvatar: boolean;
  onDisappear: (ins: HTMLDivElement) => void;
}

export default class Barrage extends React.Component<IProps, {}> {
  private ins: HTMLDivElement | null = null;

  componentDidMount() {
    const insNotNull = this.ins as HTMLDivElement;
    insNotNull.onanimationend = () => this.props.onDisappear(insNotNull);
  }
  
  render() {
    return (
      <div
        ref={e => this.ins = e}
        style={{
          position: 'absolute',
          width: 'fit-content',
          left: '100vw',
          top: `${this.props.initY}px`,
          fontSize: `${this.props.fontSize}px`,
          animation: `barrage-move ${this.props.moveTime}s linear forwards`
        }}
      >
        { this.props.showAvatar ? <Avatar size={this.props.fontSize + 6} src={this.props.avatarUrl} /> : <span></span> }
        <div>{this.props.content}</div>
      </div>
    );
  }
}
