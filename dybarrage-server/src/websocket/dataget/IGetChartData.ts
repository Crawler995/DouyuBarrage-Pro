import { RoomUtil } from "../RoomManager";

export default interface IGetChartData {
  // init chart basic style
  getStyle: () => string,
  // get series (Echarts concept) (real data) of specific room
  getSeries: (util: RoomUtil) => Promise<string>;
}