import React from 'react'
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed } from 'lucide-react'

const { BaseLayer, Overlay } = LayersControl

interface MapViewerProps {
  onSelectLocation: (location: {
    lat: number
    lng: number
    name: string
  }) => void
}

const MapViewer: React.FC<MapViewerProps> = ({ onSelectLocation }) => {
  // Center of the map (example: generic center, can be updated with geolocation)
  const defaultCenter: [number, number] = [4.6097, -74.0817] // Bogotá, Colombia as example start
  const defaultZoom = 6

  function MapEvents() {
    useMapEvents({
      click(e) {
        onSelectLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: 'Ubicación Seleccionada', // Would reverse geocode here in real app
        })
      },
    })
    return null
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] rounded-lg overflow-hidden shadow-xl border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <LayersControl position="topright">
          {/* Base Layers */}
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Esri World Imagery (Satélite)">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>

          <LayersControl.Overlay name="Zonas de Calor (OpenWeather)">
            <TileLayer
              url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${import.meta.env.PUBLIC_OPENWEATHER_API_KEY}`}
              attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            />
          </LayersControl.Overlay>
        </LayersControl>
        <MapEvents />
      </MapContainer>

      {/* Overlay UI elements */}
      <div className="absolute top-4 left-14 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-sm">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <LocateFixed className="w-5 h-5 text-blue-600" />
          Explorador de Riesgos
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Capas activas: Deforestación (Rojo) y Clima.
        </p>
      </div>
    </div>
  )
}

export default MapViewer
