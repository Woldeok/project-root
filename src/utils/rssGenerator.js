const xmlbuilder = require('xmlbuilder');

// RSS 변환 함수
function convertToRSS(items, { title, description, link }) {
  const feed = xmlbuilder.create('rss', { version: '1.0', encoding: 'UTF-8' })
    .att('version', '2.0')
    .ele('channel');

  // RSS 메타데이터
  feed.ele('title', {}, title);
  feed.ele('description', {}, description);
  feed.ele('link', {}, link);

  // 데이터 항목(RSS 아이템) 추가
  items.forEach(item => {
    const feedItem = feed.ele('item');
    feedItem.ele('title', {}, item.title);
    feedItem.ele('description', {}, item.description);
    feedItem.ele('link', {}, item.link);
    feedItem.ele('pubDate', {}, item.pubDate);
  });

  return feed.end({ pretty: true });
}

module.exports = { convertToRSS };
