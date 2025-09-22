import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { formatDateRange } from './eventUtils'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const TILE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function getDefaultCenter(events) {
  if (!events.length) return [44.0582, -79.452]
  const lat = events.reduce((sum, event) => sum + event.lat, 0) / events.length
  const lng = events.reduce((sum, event) => sum + event.lng, 0) / events.length
  return [lat, lng]
}

function distance(aLat, aLng, bLat, bLng) {
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function clusterEvents(events) {
  const CLUSTER_RADIUS_KM = 1.2
  const clusters = []

  events.forEach((event) => {
    let cluster = clusters.find((group) => distance(group.lat, group.lng, event.lat, event.lng) < CLUSTER_RADIUS_KM)
    if (cluster) {
      cluster.events.push(event)
      cluster.lat = cluster.events.reduce((sum, e) => sum + e.lat, 0) / cluster.events.length
      cluster.lng = cluster.events.reduce((sum, e) => sum + e.lng, 0) / cluster.events.length
    } else {
      clusters.push({ lat: event.lat, lng: event.lng, events: [event] })
    }
  })

  return clusters
}

function MapBoundsTracker({ onChange }) {
  const map = useMap()

  React.useEffect(() => {
    window.__leafletMap = map
    const update = () => {
      const bounds = map.getBounds()
      onChange(bounds)
    }
    update()
    map.on('moveend', update)
    map.on('zoomend', update)
    return () => {
      map.off('moveend', update)
      map.off('zoomend', update)
    }
  }, [map, onChange])

  return null
}

export default function EventMap({ events, onSelectEvent }) {
  const eventsWithLocation = React.useMemo(() => events.filter((event) => event.hasLocation), [events])
  const [bounds, setBounds] = React.useState(null)

  const center = React.useMemo(() => getDefaultCenter(eventsWithLocation), [eventsWithLocation])
  const clusters = React.useMemo(() => clusterEvents(eventsWithLocation), [eventsWithLocation])

  const visibleEvents = React.useMemo(() => {
    if (!bounds) return eventsWithLocation
    return eventsWithLocation.filter((event) => bounds.contains(L.latLng(event.lat, event.lng)))
  }, [bounds, eventsWithLocation])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={false}
          className="h-[420px] w-full"
          whenReady={(map) => {
            if (map?.target) {
              window.__leafletMap = map.target
            }
          }}
        >
          <TileLayer url={TILE_LAYER} attribution={ATTRIBUTION} />
          <MapBoundsTracker onChange={setBounds} />
          {clusters.map((cluster) =>
            cluster.events.length === 1 ? (
              <Marker key={cluster.events[0].slug} position={[cluster.lat, cluster.lng]}>
                <Popup>
                  <button
                    type="button"
                    onClick={() => onSelectEvent?.(cluster.events[0])}
                    className="text-left text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    {cluster.events[0].title}
                  </button>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatDateRange(cluster.events[0].nextOccurrence || cluster.events[0].occurrences?.[0], cluster.events[0].allDay)}
                  </p>
                </Popup>
              </Marker>
            ) : (
              <ClusterMarker key={`${cluster.lat}-${cluster.lng}`} cluster={cluster} onSelectEvent={onSelectEvent} />
            )
          )}
        </MapContainer>
      </div>

      <div className="space-y-4">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Events in view</h3>
          <p className="text-sm text-slate-600">
            {visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'} match the current map view.
          </p>
        </header>
        <ul className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 420 }}>
          {visibleEvents.map((event) => {
            const occurrence = event.nextOccurrence || event.occurrences?.[0]
            return (
              <li key={event.slug}>
                <button
                  type="button"
                  onClick={() => onSelectEvent?.(event)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-sm transition hover:border-emerald-400 hover:text-emerald-800"
                >
                  <span className="block text-base font-semibold">{event.title}</span>
                  <span className="block text-xs text-slate-600">{event.town}</span>
                  <span className="block text-xs text-slate-500">{formatDateRange(occurrence, event.allDay)}</span>
                </button>
              </li>
            )
          })}
          {!visibleEvents.length && (
            <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No events in this view. Pan or zoom to explore other towns.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

function ClusterMarker({ cluster, onSelectEvent }) {
  const icon = React.useMemo(() => {
    return L.divIcon({
      className: 'cluster-marker',
      html: `<div style="background:#059669;color:white;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-weight:600;box-shadow:0 10px 20px rgba(5,150,105,0.25);">${cluster.events.length}</div>`,
      iconSize: [42, 42],
    })
  }, [cluster.events.length])

  return (
    <Marker position={[cluster.lat, cluster.lng]} icon={icon} eventHandlers={{
      click: () => {
        if (cluster.events.length === 1) {
          onSelectEvent?.(cluster.events[0])
        }
      },
    }}>
      <Popup>
        <div className="space-y-2">
          {cluster.events.map((event) => (
            <button
              key={event.slug}
              type="button"
              onClick={() => onSelectEvent?.(event)}
              className="block w-full text-left text-sm font-semibold text-emerald-700 hover:underline"
            >
              {event.title}
            </button>
          ))}
        </div>
      </Popup>
    </Marker>
  )
}
