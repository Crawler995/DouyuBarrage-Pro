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
  limit?: number
) => {
  return axiosIns.get(`/room/${getRoomId()}/crawlrec?`, {
    params: {
      startTime,
      stopTime,
      offset,
      limit
    }
  });
};

export const getHighlightRecord = (
  startTime?: string,
  stopTime?: string,
  offset?: number,
  limit?: number
) => {
  return axiosIns.get(`/room/${getRoomId()}/highlightrec?`, {
    params: {
      startTime,
      stopTime,
      offset,
      limit
    }
  });
};

export const downloadBarragesByCrawlRecord = (
  columns: Array<string>,
  crawlRecordIds?: Array<number>
) => {
  return axiosIns.post(
    `/room/${getRoomId()}/crawlrec/dmdownload`,
    {
      columns,
      crawlRecordIds
    },
    {
      responseType: 'blob'
    }
  );
};

export const downloadBarragesByHighlightRecord = (
  columns: Array<string>,
  afterTime: number,
  highlightRecordIds?: Array<number>
) => {
  return axiosIns.post(
    `/room/${getRoomId()}/highlightrec/dmdownload`,
    {
      columns,
      highlightRecordIds,
      afterTime
    },
    {
      responseType: 'blob'
    }
  );
};

export const getWordFrequency = () => {
  return axiosIns.get(`/room/${getRoomId()}/wordcloud`);
};

export const getDmLevelData = () => {
  return axiosIns.get(`/room/${getRoomId()}/dmlevel`);
};
