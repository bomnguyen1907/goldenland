'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import {
    fetchNearbyPlaces,
    NEARBY_PLACE_CATEGORIES,
    type NearbyPlace,
} from '@/app/services/maps'

const TABS = NEARBY_PLACE_CATEGORIES

function formatDist(m: number): string {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`
}

export default function MapSection({ lat, lng, name }: { lat: number; lng: number; name: string }) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const nearbyLayerRef = useRef<any>(null)
    const [activeTab, setActiveTab] = useState(0)
    const [places, setPlaces] = useState<NearbyPlace[]>([])
    const [loadingPlaces, setLoadingPlaces] = useState(false)

    // Init map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return
        let cancelled = false

        import('leaflet').then((L) => {
            if (cancelled || !mapRef.current || mapInstanceRef.current) return

            // Fix default marker icons in webpack/Next.js
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            })

            const map = L.map(mapRef.current).setView([lat, lng], 15)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map)

            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`<strong>${name}</strong>`)
                .openPopup()

            mapInstanceRef.current = map
            nearbyLayerRef.current = L.layerGroup().addTo(map)
        })

        return () => {
            cancelled = true
            mapInstanceRef.current?.remove()
            mapInstanceRef.current = null
        }
    }, [lat, lng, name])

    // Fetch nearby places on tab change
    useEffect(() => {
        const tab = TABS[activeTab]
        const controller = new AbortController()
        let cancelled = false
        setLoadingPlaces(true)
        setPlaces([])

        fetchNearbyPlaces({
            lat,
            lng,
            query: tab.query,
            signal: controller.signal,
        })
            .then((results) => {
                if (cancelled) return
                setPlaces(results)

                // Update nearby markers on map
                import('leaflet').then((L) => {
                    if (cancelled) return
                    nearbyLayerRef.current?.clearLayers()
                    const icon = L.divIcon({
                        className: '',
                        html: `<div style="background:#10b981;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3)">${tab.icon}</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    })
                    results.forEach((p) => {
                        L.marker([p.lat, p.lng], { icon })
                            .addTo(nearbyLayerRef.current)
                            .bindPopup(p.name)
                    })
                })
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === 'AbortError') return
                if (!cancelled) setPlaces([])
            })
            .finally(() => {
                if (!cancelled) setLoadingPlaces(false)
            })

        return () => {
            cancelled = true
            controller.abort()
        }
    }, [activeTab, lat, lng])

    return (
        <div>
            {/* Map */}
            <div className="w-full rounded-xl overflow-hidden shadow-sm" style={{ height: 400, isolation: 'isolate' }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 overflow-x-auto">
                {TABS.map((tab, i) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(i)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            activeTab === i
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Place list */}
            <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
                {loadingPlaces ? (
                    <div className="p-6 text-center text-sm text-gray-400 animate-pulse">Đang tải...</div>
                ) : places.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">Không tìm thấy trong vòng 2 km</div>
                ) : (
                    places.map((p, i) => {
                        const mins = Math.ceil(p.distance / 80)
                        return (
                            <div
                                key={p.id}
                                className={`flex items-center justify-between px-4 py-3 text-sm ${i < places.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base flex-shrink-0">{TABS[activeTab].icon}</span>
                                    <span className="font-medium text-gray-800 truncate">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-4 text-gray-500">
                                    <span>{formatDist(p.distance)}</span>
                                    <span className="text-gray-300">|</span>
                                    <span>🚶 {mins} phút</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
