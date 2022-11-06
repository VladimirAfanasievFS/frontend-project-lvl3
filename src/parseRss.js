const toObject = (doc) => {
  const result = Object.fromEntries([...doc.children]
    .map(({ localName, textContent }) => [localName, textContent]));
  return result;
};

const parseRss = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const title = doc.querySelector('channel>title').textContent;
  const link = doc.querySelector('channel>link').textContent;
  const description = doc.querySelector('channel>description').textContent;
  const items = [...doc.querySelectorAll('channel>item')].map(toObject);

  return {
    title,
    link,
    description,
    items,
  };
};

export default parseRss;
