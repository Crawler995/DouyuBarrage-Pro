export interface BarrageInfo {
  id: string,
  time: string,
  room_id: string,
  sender_name: string,
  sender_level: number,
  sender_avatar_url: string,
  dm_content: string,
  badge_name: string | null,
  badge_level: number | null
}