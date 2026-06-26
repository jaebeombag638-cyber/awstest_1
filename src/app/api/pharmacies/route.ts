import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: '주소를 입력해주세요.' }, { status: 400 });
  }

  const REST_KEY = process.env.KAKAO_REST_API_KEY;
  if (!REST_KEY) {
    return NextResponse.json({ error: 'Kakao API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  // 주소 → 좌표 변환 (주소 검색 실패 시 키워드 검색으로 폴백)
  const geoRes = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
  );
  const geoData = await geoRes.json();

  let lat: string, lng: string;

  if (geoData.documents && geoData.documents.length > 0) {
    ({ x: lng, y: lat } = geoData.documents[0]);
  } else {
    console.log('[주소검색 실패]', JSON.stringify(geoData));
    // 주소 검색 실패 시 키워드 검색으로 폴백
    const keyRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}&size=1`,
      { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
    );
    const keyData = await keyRes.json();
    console.log('[키워드검색 결과]', JSON.stringify(keyData));

    if (!keyData.documents || keyData.documents.length === 0) {
      return NextResponse.json({ error: '주소를 찾을 수 없습니다. 도로명이나 동네 이름을 포함해 입력해보세요.' }, { status: 404 });
    }
    lng = keyData.documents[0].x;
    lat = keyData.documents[0].y;
  }

  // 좌표 기반 근처 약국 검색
  const searchRes = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=약국&x=${lng}&y=${lat}&radius=2000&size=10&sort=distance`,
    { headers: { Authorization: `KakaoAK ${REST_KEY}` } }
  );
  const searchData = await searchRes.json();

  const pharmacies = (searchData.documents || []).map(
    (doc: {
      id: string;
      place_name: string;
      road_address_name: string;
      address_name: string;
      phone: string;
      x: string;
      y: string;
      distance: string;
    }) => ({
      id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      phone: doc.phone,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      distance: parseInt(doc.distance),
    })
  );

  return NextResponse.json({ pharmacies, center: { lat: parseFloat(lat), lng: parseFloat(lng) } });
}
