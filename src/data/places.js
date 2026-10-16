// Original screenshots are the source for names, ratings, prices and photographs.
// Coordinates use WGS84; area anchors are explicitly distinguished from place points.
const images = {
  6749: new URL('../../IMG_6749.JPG', import.meta.url).href,
  6750: new URL('../../IMG_6750.JPG', import.meta.url).href,
  6751: new URL('../../IMG_6751.JPG', import.meta.url).href,
  6752: new URL('../../IMG_6752.JPG', import.meta.url).href,
  6753: new URL('../../IMG_6753.JPG', import.meta.url).href,
  6754: new URL('../../IMG_6754.JPG', import.meta.url).href,
  6755: new URL('../../IMG_6755.JPG', import.meta.url).href,
};

export const categories = [
  { id: 'all', label: '전체', icon: 'grid', color: '#315c4e' },
  { id: 'nature', label: '자연', icon: 'leaf', color: '#4d7d5a' },
  { id: 'sight', label: '명소', icon: 'camera', color: '#688d96' },
  { id: 'temple', label: '사찰', icon: 'temple', color: '#b98547' },
  { id: 'food', label: '먹거리', icon: 'cup', color: '#c9785c' },
  { id: 'shopping', label: '쇼핑', icon: 'bag', color: '#94749d' },
  { id: 'stay', label: '숙소', icon: 'bed', color: '#577ea3' },
  { id: 'transport', label: '교통', icon: 'plane', color: '#727b88' },
];

const point = (lat, lng, url, label = 'OpenStreetMap 위치 자료') => ({
  coordinates: [lat, lng], locationAccuracy: 'place', locationSource: { label, url },
});
const area = (lat, lng, url, label) => ({
  coordinates: [lat, lng], locationAccuracy: 'area', locationSource: { label, url },
});
const longxiang = area(30.25694,120.15951,'https://mapcarta.com/W328911728','룽샹차오역 주변 · 지점 위치 미확인');
const fengqi = area(30.26547,120.1591,'https://mapcarta.com/N6098961179','펑치루역 주변 · 정확한 지점 미확인');
const lake = area(30.25069,120.14442,'https://mapcarta.com/15924540','시후 권역 대표 위치 · 입구 위치 아님');
const rows = [
  ['west-lake','시후 풍경구','杭州西湖风景名胜区','nature',4.9,null,6750,635,lake,'시후','호수와 산책길 사이에서 만나는 항저우의 풍경. 넓은 풍경구이므로 방문할 구역을 정해보세요.'],
  ['lingyin','링인사','灵隐寺','temple',null,null,6750,1755,point(30.2428,120.0968,'https://mapcarta.com/N1218588822'),'링인','숲에 둘러싸인 사찰. 융푸사와 타오광사를 함께 살펴보는 날에 넣어보세요.'],
  ['qinghefang','칭허팡 보행거리','清河坊步行街','sight',4.7,null,6751,908,point(30.24021,120.164737,'https://tripomatic.com/en/poi/qinghefang-ancient-street-poi%3A47878','거리 대표 위치 · Tripomatic'),'시후 남동쪽','거리의 상점과 골목을 구경하는 산책 코스. 중국어 이름으로 현지 지도에서도 찾아보세요.'],
  ['xixi','시시 국가습지공원','西溪国家湿地公园','nature',4.8,null,6753,915,area(30.2663,120.0626,'https://mapcarta.com/W783223294','습지공원 대표 위치 · 방문 입구 확인 필요'),'시시','물길과 초록 풍경을 천천히 둘러보는 날. 공원 범위가 넓으니 입구와 방문 구역을 먼저 정하세요.'],
  ['hubin','후빈 in77','杭州湖滨in77','shopping',4.9,null,6751,535,longxiang,'후빈','시후 동쪽의 쇼핑 구역. 산책 사이에 상점과 먹거리를 둘러볼 수 있어요.'],
  ['wulin-night','우린 야시장','杭州武林夜市','food',4.8,null,6753,1288,fengqi,'도심','여행의 저녁을 채우는 야시장. 방문 전 현지 지도에서 운영 여부와 정확한 입구를 확인하세요.'],
  ['atour','아투어 호텔 · 펑치루역','杭州西湖湖滨凤起路地铁站亚朵酒店','stay',4.9,null,6753,428,fengqi,'펑치루','원본에 저장된 숙소 후보. 예약이 확정된 숙소는 아니며 지도는 펑치루역 인근을 표시해요.'],
  ['guyongjin','구 융진문','杭州西湖风景名胜区-古涌金门','sight',4.6,null,6750,1008,lake,'시후','원본에 저장된 시후의 명소. 지도는 시후 권역을 표시하며 정확한 위치는 현지 지도에서 확인하세요.'],
  ['cruise','첸탕강 야경 유람선','杭州钱塘江夜游(滨江码头)','sight',4.7,null,6750,1381,area(30.211,120.2072,'https://mapcarta.com/25560448','빈장구 대표 위치 · 선착장 위치 미확인'),'빈장','빈장 선착장에서 출발하는 것으로 저장된 야경 유람선. 탑승 위치와 운항 일정은 별도 확인이 필요해요.'],
  ['qianjiang-park','첸장 세기공원','钱江世纪公园','nature',4.7,null,6749,952,area(30.24532,120.23634,'https://mapcarta.com/W536682374','첸장 세기공원 A구역 대표 위치'),'첸장','강변의 공원 풍경을 담은 저장 장소. 지도는 여러 구역 중 A구역을 표시해요.'],
  ['yongfu','융푸사','永福寺','temple',null,null,6749,1325,point(30.24121,120.09185,'https://mapcarta.com/N6333532917'),'링인','링인 권역의 사찰. 같은 날 주변 사찰과 함께 방문 순서를 구성해볼 수 있어요.'],
  ['taoguang','타오광사','杭州西湖风景名胜区-韬光寺','temple',null,null,6749,1699,point(30.24499,120.09149,'https://mapcarta.com/W1104396359'),'링인','링인 권역에 있는 사찰. 사찰을 잇는 일정은 현지 지형과 체력에 맞춰 조정하세요.'],
  ['faxi','팍시사','上天竺法喜讲寺','temple',null,null,6752,555,point(30.23669,120.09084,'https://www.wikidata.org/wiki/Q131417000','Wikidata 사찰 위치'),'톈주','원본에 저장된 상톈주 팍시사. 다른 사찰과 함께 둘러보는 예시 일정에 포함되어 있어요.'],
  ['wulin-square','우린광장','武林广场','sight',4.7,null,6751,1281,point(30.27337,120.15857,'https://mapcarta.com/W589390765'),'우린','항저우 도심의 광장. 운하 산책을 마친 뒤 도심으로 돌아오는 일정에 넣어보세요.'],
  ['wulin-pier','우린먼 선착장','武林门码头','transport',null,null,6752,930,area(30.27486,120.15994,'https://mapcarta.com/N6505799695','우린광장역 주변 · 선착장은 역 북쪽, 입구 확인 필요'),'우린','운하 여행을 계획할 때 참고할 선착장. 지도는 인근 역을 표시하며 승선장과 배편은 별도 확인하세요.'],
  ['xiaohe','샤오허 역사문화거리','小河历史文化街区','sight',4.7,null,6752,1304,area(30.30799,120.12721,'https://mapcarta.com/27816028','샤오허 권역 대표 위치 · 거리 입구 미확인'),'샤오허','운하 주변의 역사문화거리. 지도는 샤오허 권역을 표시하며 산책 출발점은 현지에서 확인하세요.'],
  ['gongchen','궁천교','拱宸桥','sight',4.7,null,6752,1677,area(30.32046,120.13392,'https://mapcarta.com/N9495187310','궁천교 권역 대표 위치 · 다리 진입점 미확인'),'궁천교','운하를 둘러보는 일정의 저장 장소. 지도는 궁천교 주변 권역을 표시해요.'],
  ['ice-cc','예런셴성 · 공롄 CC점','野人先生现做冰淇淋(杭州工联CC店)','food',4.2,25,6749,578,longxiang,'후빈','원본에 저장된 아이스크림 가게의 공롄 CC 지점. 후빈88점과 별개의 장소예요.'],
  ['ice-88','예런셴성 · 후빈88점','野人先生现做冰淇淋(杭州湖滨88店)','food',4.2,30,6751,1655,area(30.25792,120.16593,'https://mapcarta.com/N5289271244','후빈 권역 대표 위치 · 지점 위치 미확인'),'후빈','원본에 저장된 아이스크림 가게의 후빈88 지점. 표시 가격은 원본의 인당 가격이에요.'],
  ['outlet','아오페이거 팩토리숍','奥菲歌工厂店(杭州良渚店)','shopping',4.6,null,6754,594,area(30.38253,120.04183,'https://mapcarta.com/15953548','량주 권역 대표 위치 · 매장 위치 미확인'),'량주','량주 지점으로 저장된 쇼핑 장소. 도심과 떨어진 권역이므로 정확한 매장 위치를 먼저 확인하세요.'],
  ['silk-city','항저우 중국 실크시티','杭州中国丝绸城','shopping',null,null,6754,966,fengqi,'창칭','원본의 실크 쇼핑 장소. 실크거리와 각각 저장되어 있어 항목을 분리했어요. 지도는 도심의 대략 위치예요.'],
  ['silk-street','항저우 실크거리','杭州丝绸一条街','shopping',4.5,null,6754,1337,fengqi,'창칭','원본에 저장된 실크 쇼핑 거리. 실크시티와 인접할 수 있지만 서로 다른 저장 항목이에요.'],
  ['kinglomo-xixi','킹로모 · 시시 인상성점','金粒门KINGLOMO(杭州西溪印象城店)','food',4.5,null,6754,1710,area(30.2515,120.0316,'https://mapcarta.com/29606284','우창 권역 대표 위치 · 매장 위치 미확인'),'우창','원본에 저장된 간식 가게의 시시 인상성 지점. 샤오산 지점과 혼동하지 않도록 확인하세요.'],
  ['kinglomo-xiaoshan','킹로모 · 샤오산점','金粒门KINGLOMO(杭州萧山万象汇店)','food',4.6,null,6755,648,area(30.1862,120.2598,'https://mapcarta.com/15925664','샤오산구 대표 위치 · 매장 위치 미확인'),'샤오산','원본의 샤오산 완샹후이 지점. 지도는 샤오산 권역이며 매장 주소는 현지 지도에서 확인하세요.'],
  ['qipao','완쑤 치파오','挽苏旗袍(杭州南宋御街店)','shopping',4.5,null,6755,1021,area(30.24021,120.164737,'https://tripomatic.com/en/poi/qinghefang-ancient-street-poi%3A47878','칭허팡 주변 대표 위치 · 매장 위치 미확인'),'칭허팡','난쑹위제 지점으로 저장된 치파오 가게. 지도는 칭허팡 인근을 표시해요.'],
  ['xianghu','샹후 국가관광휴양구','湘湖国家旅游度假区','nature',4.8,null,6755,1394,area(30.183333,120.25,'https://www.wikidata.org/wiki/Q16935741','샹후 권역 대략 위치 · 방문 구역 확인 필요'),'샤오산','도심 밖에서 호수 풍경을 즐기는 저장 장소. 휴양구의 방문 구역과 입구를 먼저 정해보세요.'],
  ['airport','항저우 샤오산 국제공항','杭州萧山国际机场','transport',null,null,6753,1660,area(30.229444,120.434444,'https://www.wikidata.org/wiki/Q1197691','공항 대표 위치 · 이용 터미널 확인 필요'),'샤오산 공항','여행의 시작과 끝. 실제 항공편과 터미널이 정해지면 일정에 추가하세요.'],
];

export const places = rows.map(([id,nameKo,nameZh,category,rating,price,img,y,location,neighborhood,description]) => ({
  id,nameKo,nameZh,category,rating,price,neighborhood,description,...location,
  photo: { src: images[img], x: 57, y, width: 202, height: 160, sourceWidth: 1080, sourceHeight: 2340 },
}));
export const placeById = new Map(places.map(p => [p.id,p]));
export const categoryById = new Map(categories.map(c => [c.id,c]));
