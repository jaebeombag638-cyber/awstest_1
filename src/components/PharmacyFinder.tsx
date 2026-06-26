'use client';

import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => KakaoMap;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: object) => KakaoMarker;
        MarkerImage: new (src: string, size: KakaoSize) => object;
        Size: new (w: number, h: number) => KakaoSize;
        InfoWindow: new (options: object) => KakaoInfoWindow;
        event: { addListener: (target: object, type: string, handler: () => void) => void };
      };
    };
  }
  interface KakaoMap { setCenter: (latlng: KakaoLatLng) => void }
  interface KakaoLatLng {}
  interface KakaoMarker {}
  interface KakaoSize {}
  interface KakaoInfoWindow { open: (map: KakaoMap, marker: KakaoMarker) => void }
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance?: number;
}

export default function PharmacyFinder() {
  const [address, setAddress] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);

  const loadKakaoScript = (): Promise<void> =>
    new Promise((resolve) => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(resolve);
        return;
      }
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
      script.onload = () => window.kakao.maps.load(resolve);
      document.head.appendChild(script);
    });

  useEffect(() => {
    if (!center || !mapRef.current || pharmacies.length === 0) return;

    loadKakaoScript().then(() => {
      const { kakao } = window;
      const centerLatLng = new kakao.maps.LatLng(center.lat, center.lng);

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new kakao.maps.Map(mapRef.current!, {
          center: centerLatLng,
          level: 4,
        });
      } else {
        mapInstanceRef.current.setCenter(centerLatLng);
      }

      const map = mapInstanceRef.current;

      pharmacies.forEach((pharmacy) => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(pharmacy.lat, pharmacy.lng),
          map,
        });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:8px 10px;font-size:12px;line-height:1.5;"><b>${pharmacy.name}</b><br/><span style="color:#666">${pharmacy.address}</span></div>`,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker);
        });
      });

      new kakao.maps.Marker({
        position: centerLatLng,
        map,
        image: new kakao.maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          new kakao.maps.Size(24, 35)
        ),
      });
    });
  }, [center, pharmacies]);

  const handleSearch = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setPharmacies([]);
    setCenter(null);

    try {
      const res = await fetch(`/api/pharmacies?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPharmacies(data.pharmacies);
        setCenter(data.center);
      }
    } catch {
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-blue-50 rounded-2xl p-5">
      <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
        <span>📍</span> 근처 약국 찾기
      </h3>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="도로명 주소 입력 (예: 서울시 강남구 테헤란로 123)"
          className="flex-1 border border-blue-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {pharmacies.length > 0 && (
        <>
          <div ref={mapRef} className="w-full h-64 rounded-xl mb-4 border border-blue-200 bg-gray-100" />
          <div className="space-y-2">
            {pharmacies.map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-lg mt-0.5 shrink-0">🏥</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <p className="text-gray-500 text-xs truncate">{p.address}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="text-blue-600 text-xs hover:underline">
                        {p.phone}
                      </a>
                    )}
                    {p.distance !== undefined && (
                      <span className="text-gray-400 text-xs">
                        {p.distance < 1000
                          ? `${p.distance}m`
                          : `${(p.distance / 1000).toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
