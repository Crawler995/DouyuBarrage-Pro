import React from 'react';
import { Checkbox } from 'antd';
import { CheckboxValueType, CheckboxOptionType } from 'antd/lib/checkbox/Group';

const options: CheckboxOptionType[] = [
  { label: 'id', value: 'id' },
  { label: '发送时间', value: 'time' },
  { label: '房间号', value: 'room_id' },
  { label: '发送者昵称', value: 'sender_name' },
  { label: '发送者等级', value: 'sender_level' },
  { label: '发送者头像URL', value: 'sender_avatar_url' },
  { label: '弹幕内容', value: 'dm_content' },
  { label: '徽章名称', value: 'badge_name' },
  { label: '徽章等级', value: 'badge_level' }
];

export const barragesFileDefaultColumns: string[] = ['time', 'sender_name', 'dm_content'];

export default function BarrageDownloadCheckBox(props: {
  onChange: (checkedValue: CheckboxValueType[]) => void;
}) {
  return (
    <Checkbox.Group
      options={options}
      defaultValue={barragesFileDefaultColumns}
      onChange={props.onChange}
    />
  );
}
