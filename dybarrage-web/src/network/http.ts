import axios from 'axios';
import getRoomId from '../util/getRoomId';

const axiosIns = axios.create({
  baseURL: '/api'
});

export const getRoomDyInfo = () => {
  return axiosIns.get(`/room/${getRoomId()}/dyinfo`);
};