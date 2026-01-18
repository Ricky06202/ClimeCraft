import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { AlertTriangle, Droplets, Thermometer, Wind, X } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RiskData {
  humedad: number
  temperatura: number
  viento: number
  vegetationTrend: number[]
  riskLevel: 'Bajo' | 'Medio' | 'Alto'
  isSimulated?: boolean
}

interface RiskCardProps {
  locationName: string
  onClose: () => void
  data: RiskData
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const RiskCard: React.FC<RiskCardProps> = ({ locationName, onClose, data }) => {
  // Use data from props
  const chartData = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Cobertura Boscosa (%)',
        data: data.vegetationTrend,
        borderColor: 'rgb(22, 163, 74)', // Green-600
        backgroundColor: 'rgba(22, 163, 74, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  }

  const riskColors = {
    Bajo: 'bg-green-100 text-green-800',
    Medio: 'bg-yellow-100 text-yellow-800',
    Alto: 'bg-red-100 text-red-800',
  }

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl z-50 flex flex-col border border-gray-100 animate-in slide-in-from-right-10 duration-300">
      {/* Simulation Warning Banner */}
      {data.isSimulated && (
        <div className="bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800 text-center border-b border-amber-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Modo Simulación: Esperando API Key
        </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
              riskColors[data.riskLevel]
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Riesgo {data.riskLevel}
          </span>
          <h2 className="text-xl font-bold text-gray-800 leading-tight">
            {locationName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Lat: 4.609 • Lng: -74.081
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Indicators */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold text-blue-700">
              {data.humedad}%
            </span>
            <span className="text-[10px] text-blue-600/80 font-medium">
              Humedad
            </span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
            <Thermometer className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-amber-700">
              {data.temperatura}°C
            </span>
            <span className="text-[10px] text-amber-600/80 font-medium">
              Temp.
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1">
            <Wind className="w-5 h-5 text-slate-500" />
            <span className="text-xl font-bold text-slate-700">
              {data.viento}km
            </span>
            <span className="text-[10px] text-slate-600/80 font-medium">
              Viento
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 block">
            Tendencia de Deforestación
          </h3>
          <Line options={options} data={chartData} />
        </div>

        {/* Diagnosis Text */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-800">
            Diagnóstico IA (Simulado)
          </h3>
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
            <p className="text-xs text-red-800 text-justify leading-relaxed">
              La zona presenta una <strong>vulnerabilidad crítica</strong> a
              deslizamientos debido a la pérdida del 40% de la capa vegetal en
              los últimos 5 años y la proximidad a cuerpos de agua inestables.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition shadow-lg shadow-gray-200">
          Ver Plan de Mitigación
        </button>
      </div>
    </div>
  )
}

export default RiskCard
