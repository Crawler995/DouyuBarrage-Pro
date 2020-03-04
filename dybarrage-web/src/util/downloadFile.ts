export default (data: any, fileName: string) => {
  const blob = new Blob([data]);
  const element = document.createElement('a');
  element.style.position = 'absolute';
  const href = window.URL.createObjectURL(blob);

  element.href = href;
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  window.URL.revokeObjectURL(href);
};
