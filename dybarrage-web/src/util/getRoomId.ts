// get roomId from the url
const getRoomId = (): string => {
  const search = window.location.search;

  if(search === '') {
    return '';
  }

  const regx = /roomid=(\d+)/;
  const arr = search.match(regx);

  if(arr === null) {
    return '';
  }

  return arr[1];
};

export default getRoomId;