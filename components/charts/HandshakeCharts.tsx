import { 
  Sankey, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis,
  Cell, PieChart, Pie
} from 'recharts'

// Handshake Flow Sankey Diagram
export function HandshakeFlowChart({ data }: any) {
  if (!data) return null

  // Sample data structure for handshake flow
  const sankeyData = {
    nodes: [
      { name: 'Customer Requests Brand' },
      { name: 'TBWA Brand Available' },
      { name: 'TBWA Brand Not Available' },
      { name: 'Alternative Suggested' },
      { name: 'Customer Accepts' },
      { name: 'Customer Rejects' },
      { name: 'Sale Completed' },
      { name: 'Sale Lost' }
    ],
    links: [
      { source: 0, target: 1, value: 800 },
      { source: 0, target: 2, value: 200 },
      { source: 1, target: 6, value: 750 },
      { source: 1, target: 7, value: 50 },
      { source: 2, target: 3, value: 200 },
      { source: 3, target: 4, value: 140 },
      { source: 3, target: 5, value: 60 },
      { source: 4, target: 6, value: 140 },
      { source: 5, target: 7, value: 60 }
    ]
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        node={{ 
          fill: '#3B82F6',
          strokeWidth: 2
        }}
        link={{
          stroke: '#94A3B8',
          strokeOpacity: 0.5
        }}
      >
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              return (
                <div className="bg-white p-2 shadow rounded border">
                  <p className="text-sm">{payload[0].payload.source.name} → {payload[0].payload.target.name}</p>
                  <p className="text-sm font-bold">{payload[0].value} transactions</p>
                </div>
              )
            }
            return null
          }}
        />
      </Sankey>
    </ResponsiveContainer>
  )
}

// Brand Switch Matrix Heatmap
export function BrandSwitchMatrix({ data }: any) {
  // Create matrix data
  const brands = ['JTI', 'Alaska', 'Oishi', 'Del Monte', 'Peerless']
  const competitorBrands = ['Marlboro', 'Bear Brand', 'Jack n Jill', 'Dole', 'Magnolia']
  
  const matrixData = brands.flatMap((from, i) => 
    competitorBrands.map((to, j) => ({
      from,
      to,
      x: j,
      y: i,
      value: Math.floor(Math.random() * 50) + 10
    }))
  )

  const colorScale = (value: number) => {
    const intensity = value / 60
    return `rgba(59, 130, 246, ${intensity})`
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 60, right: 30, bottom: 60, left: 60 }}>
        <XAxis 
          type="category" 
          dataKey="x" 
          domain={competitorBrands.map((_, i) => i)}
          ticks={competitorBrands.map((_, i) => i)}
          tickFormatter={(value) => competitorBrands[value]}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          type="category" 
          dataKey="y" 
          domain={brands.map((_, i) => i)}
          ticks={brands.map((_, i) => i)}
          tickFormatter={(value) => brands[value]}
        />
        <ZAxis dataKey="value" range={[200, 800]} />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const data = payload[0].payload
              return (
                <div className="bg-white p-2 shadow rounded border">
                  <p className="text-sm font-bold">{data.from} → {data.to}</p>
                  <p className="text-sm">{data.value} switches</p>
                </div>
              )
            }
            return null
          }}
        />
        <Scatter
          data={matrixData}
          fill="#3B82F6"
          shape={(props: any) => {
            const { cx, cy, payload } = props
            return (
              <rect
                x={cx - 30}
                y={cy - 15}
                width={60}
                height={30}
                fill={colorScale(payload.value)}
              />
            )
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// Handshake Success Rate by Brand
export function HandshakeSuccessRate({ data }: any) {
  const successData = [
    { brand: 'JTI Winston', attempts: 245, success: 201, rate: 82 },
    { brand: 'JTI Camel', attempts: 189, success: 147, rate: 78 },
    { brand: 'Alaska Milk', attempts: 156, success: 101, rate: 65 },
    { brand: 'Oishi Snacks', attempts: 134, success: 95, rate: 71 },
    { brand: 'Del Monte', attempts: 98, success: 73, rate: 74 },
    { brand: 'Peerless', attempts: 87, success: 61, rate: 70 }
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={successData} margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="brand" angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'rate') return `${value}%`
            return value
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="attempts" fill="#94A3B8" name="Attempts" />
        <Bar yAxisId="left" dataKey="success" fill="#10B981" name="Successful" />
        <Bar yAxisId="right" dataKey="rate" fill="#3B82F6" name="Success Rate %" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Handshake Value Impact
export function HandshakeValueChart({ data }: any) {
  const valueData = [
    { 
      segment: 'With Successful Handshake',
      avgBasket: 385,
      transactions: 924,
      totalValue: 355740,
      color: '#10B981'
    },
    { 
      segment: 'Failed Handshake',
      avgBasket: 245,
      transactions: 312,
      totalValue: 76440,
      color: '#F59E0B'
    },
    { 
      segment: 'No Handshake',
      avgBasket: 198,
      transactions: 2611,
      totalValue: 516978,
      color: '#94A3B8'
    }
  ]

  const pieData = valueData.map(d => ({
    name: d.segment,
    value: d.totalValue
  }))

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={valueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="segment" angle={-20} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip formatter={(value: any) => `₱${value.toLocaleString()}`} />
          <Bar dataKey="avgBasket" name="Avg Basket (₱)">
            {valueData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {valueData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `₱${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}