import { 
  ComposableMap, Geographies, Geography, Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, ResponsiveContainer,
  Cell, PieChart, Pie, Treemap
} from 'recharts'
import { scaleLinear } from 'd3-scale'

// Philippines GeoJSON URL (you'll need to add this file)
const geoUrl = "/philippines-regions.json"

// Regional Performance Heatmap
export function RegionHeatmap({ data }: any) {
  // Sample data with actual Philippine regions
  const regionData = [
    { region: 'NCR', sales: 2450000, transactions: 3847, color: '#1E40AF' },
    { region: 'Region III', sales: 1842000, transactions: 2934, color: '#2563EB' },
    { region: 'Region IV-A', sales: 2123000, transactions: 3234, color: '#3B82F6' },
    { region: 'Region VII', sales: 1421000, transactions: 2156, color: '#60A5FA' },
    { region: 'Region XI', sales: 982000, transactions: 1523, color: '#93BBFC' },
    { region: 'BARMM', sales: 421000, transactions: 687, color: '#DBEAFE' }
  ]

  const colorScale = scaleLinear()
    .domain([0, 2500000])
    .range(['#DBEAFE', '#1E40AF'] as any)

  return (
    <div className="relative h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [122, 12],
          scale: 2200
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionInfo = regionData.find(d => d.region === geo.properties.region)
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={regionInfo ? colorScale(regionInfo.sales) : '#F3F4F6'}
                    stroke="#E5E7EB"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#F59E0B' },
                      pressed: { outline: 'none' }
                    }}
                  />
                )
              })
            }
          </Geographies>
          
          {/* Major city markers */}
          <Marker coordinates={[120.9842, 14.5995]}>
            <circle r={8} fill="#EF4444" />
            <text textAnchor="middle" y={-10} className="text-xs">Manila</text>
          </Marker>
          <Marker coordinates={[123.8907, 10.3157]}>
            <circle r={6} fill="#F59E0B" />
            <text textAnchor="middle" y={-10} className="text-xs">Cebu</text>
          </Marker>
          <Marker coordinates={[125.6128, 7.0731]}>
            <circle r={6} fill="#10B981" />
            <text textAnchor="middle" y={-10} className="text-xs">Davao</text>
          </Marker>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow">
        <p className="text-xs font-semibold mb-2">Sales Performance</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-900"></div>
            <span className="text-xs">High (₱2M+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span className="text-xs">Medium (₱1-2M)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200"></div>
            <span className="text-xs">Low (<₱1M)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Urban vs Rural Sales Analysis
export function UrbanRuralChart({ data }: any) {
  const urbanRuralData = [
    { 
      category: 'Highly Urban',
      stores: 234,
      avgSales: 12500,
      tbwaShare: 28,
      urbanization: 1.0
    },
    { 
      category: 'Urban',
      stores: 456,
      avgSales: 8900,
      tbwaShare: 24,
      urbanization: 0.75
    },
    { 
      category: 'Semi-Urban',
      stores: 389,
      avgSales: 5600,
      tbwaShare: 21,
      urbanization: 0.5
    },
    { 
      category: 'Rural',
      stores: 521,
      avgSales: 3200,
      tbwaShare: 18,
      urbanization: 0.25
    }
  ]

  const pieData = urbanRuralData.map(d => ({
    name: d.category,
    value: d.stores * d.avgSales
  }))

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={urbanRuralData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="avgSales" fill="#3B82F6" name="Avg Daily Sales (₱)" />
          <Bar yAxisId="right" dataKey="tbwaShare" fill="#10B981" name="TBWA Share %" />
        </BarChart>
      </ResponsiveContainer>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#1E40AF', '#3B82F6', '#60A5FA', '#93BBFC'][index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `₱${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Poverty Rate vs Sales Correlation
export function PovertyCorrelation({ data }: any) {
  // Generate scatter plot data showing inverse correlation
  const correlationData = [
    { region: 'Makati', poverty: 1.2, avgBasket: 485, stores: 45 },
    { region: 'BGC', poverty: 1.5, avgBasket: 512, stores: 38 },
    { region: 'Quezon City', poverty: 4.8, avgBasket: 342, stores: 128 },
    { region: 'Manila', poverty: 6.2, avgBasket: 298, stores: 156 },
    { region: 'Caloocan', poverty: 8.5, avgBasket: 267, stores: 98 },
    { region: 'Marikina', poverty: 5.3, avgBasket: 315, stores: 76 },
    { region: 'Cebu City', poverty: 12.8, avgBasket: 234, stores: 142 },
    { region: 'Davao City', poverty: 14.6, avgBasket: 212, stores: 134 },
    { region: 'Rural Luzon', poverty: 28.4, avgBasket: 156, stores: 234 },
    { region: 'Rural Visayas', poverty: 35.2, avgBasket: 134, stores: 189 },
    { region: 'Rural Mindanao', poverty: 42.1, avgBasket: 118, stores: 156 },
    { region: 'BARMM', poverty: 61.5, avgBasket: 87, stores: 78 }
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="poverty" 
          name="Poverty Rate"
          unit="%"
          domain={[0, 70]}
        />
        <YAxis 
          dataKey="avgBasket" 
          name="Avg Basket Size"
          unit="₱"
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const data = payload[0].payload
              return (
                <div className="bg-white p-3 shadow rounded border">
                  <p className="font-semibold">{data.region}</p>
                  <p className="text-sm">Poverty Rate: {data.poverty}%</p>
                  <p className="text-sm">Avg Basket: ₱{data.avgBasket}</p>
                  <p className="text-sm">Stores: {data.stores}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Scatter 
          name="Regions" 
          data={correlationData} 
          fill="#3B82F6"
        >
          {correlationData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.poverty > 30 ? '#EF4444' : entry.poverty > 15 ? '#F59E0B' : '#10B981'} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// City Performance Rankings
export function CityPerformanceChart({ data }: any) {
  const cityData = [
    { city: 'Quezon City', sales: 3456000, stores: 234, growth: 12.5 },
    { city: 'Manila', sales: 2987000, stores: 189, growth: 8.3 },
    { city: 'Makati', sales: 2654000, stores: 78, growth: 15.2 },
    { city: 'Cebu City', sales: 2234000, stores: 156, growth: 10.1 },
    { city: 'Davao City', sales: 1876000, stores: 134, growth: 7.8 },
    { city: 'Caloocan', sales: 1654000, stores: 123, growth: 5.4 },
    { city: 'Taguig', sales: 1523000, stores: 67, growth: 18.9 },
    { city: 'Pasig', sales: 1432000, stores: 89, growth: 9.2 },
    { city: 'Parañaque', sales: 1234000, stores: 76, growth: 6.7 },
    { city: 'Las Piñas', sales: 987000, stores: 54, growth: 4.3 }
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={cityData}
        dataKey="sales"
        aspectRatio={4/3}
        stroke="#fff"
        fill="#3B82F6"
        content={({ x, y, width, height, value, name, payload }: any) => {
          const fontSize = width > 100 ? 14 : 10
          return (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.growth > 10 ? '#10B981' : payload.growth > 5 ? '#3B82F6' : '#F59E0B'}
                stroke="#fff"
                strokeWidth={2}
              />
              {width > 50 && height > 50 && (
                <>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 10}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={fontSize}
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={fontSize - 2}
                  >
                    ₱{(value / 1000000).toFixed(1)}M
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 20}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={fontSize - 2}
                  >
                    +{payload.growth}%
                  </text>
                </>
              )}
            </g>
          )
        }}
      />
    </ResponsiveContainer>
  )
}