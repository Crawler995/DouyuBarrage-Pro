import axios from 'axios';
import getRoomId from '../util/getRoomId';

const axiosIns = axios.create({
  baseURL: '/api'
});

export const getRoomDyInfo = () => {
  return axiosIns.get(`/room/${getRoomId()}/dyinfo`);
};

export const getCrawlRecord = (
  startTime?: string,
  stopTime?: string,
  offset?: number,
  limit?:number
) => {
  return axiosIns.get(`/room/${getRoomId()}/crawlrec?`, {
    params: {
      startTime, stopTime, offset, limit
    }
  });
}