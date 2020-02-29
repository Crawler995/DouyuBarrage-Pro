import React from 'react';
import '../App.css';

interface IProps {
  initY: number;
  moveTime: number;
  content: string;
  fontSize: number;
  onDisappear: (ins: HTMLDivElement) => void;
}

export default class Barrage extends React.Component<IProps, {}> {
  private ins: HTMLDivElement | null = null;

  componentDidMount() {
    const insNotNull = this.ins as HTMLDivElement;
    // should remove this element when disappearing
    insNotNull.onanimationend = () => this.props.onDisappear(insNotNull);
  }

  render() {
    return (
      <div
        ref={e => (this.ins = e)}
        style={{
          position: 'absolute',
          width: 'fit-content',
          left: `${100 + Math.random() * 10}vw`,
          top: `${this.props.initY}px`,
          fontSize: `${this.props.fontSize}px`,
          animation: `barrage-move ${this.props.moveTime}s linear forwards`
        }}
      >
        {this.props.content}
      </div>
    );
  }
}
