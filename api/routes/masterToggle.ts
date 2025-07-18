import { NextRequest, NextResponse } from 'next/server'
import { MasterToggleAgent } from '../../services/masterToggleAgent'
import { getMasterToggleConfig } from '../../config/masterToggleConfig'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Master Toggle Agent
const config = getMasterToggleConfig(process.env.NODE_ENV)
const masterToggleAgent = new MasterToggleAgent(supabase, config)

// Start the agent
masterToggleAgent.start().catch(console.error)

// Health check endpoint
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url)
  
  if (pathname.endsWith('/health')) {
    try {
      const health = masterToggleAgent.getHealth()
      return NextResponse.json(health)
    } catch (error) {
      return NextResponse.json(
        { error: 'Health check failed', details: error },
        { status: 500 }
      )
    }
  }
  
  // Get filter options for a dimension
  const url = new URL(request.url)
  const dimension = url.searchParams.get('dimension')
  
  if (!dimension) {
    return NextResponse.json(
      { error: 'Missing dimension parameter' },
      { status: 400 }
    )
  }
  
  try {
    const options = await masterToggleAgent.getFilterOptions(dimension)
    return NextResponse.json({
      dimension,
      options,
      count: options.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch filter options', details: error },
      { status: 500 }
    )
  }
}

// Add new toggle dimension
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dimension, sourceTable, sourceColumn, masterTable } = body
    
    if (!dimension || !sourceTable || !sourceColumn || !masterTable) {
      return NextResponse.json(
        { error: 'Missing required fields: dimension, sourceTable, sourceColumn, masterTable' },
        { status: 400 }
      )
    }
    
    await masterToggleAgent.addToggleDimension(dimension, {
      sourceTable,
      sourceColumn,
      masterTable
    })
    
    return NextResponse.json({
      success: true,
      message: `Toggle dimension '${dimension}' added successfully`,
      dimension,
      config: {
        sourceTable,
        sourceColumn,
        masterTable
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add toggle dimension', details: error },
      { status: 500 }
    )
  }
}

// Update dimension configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { dimension, enabled, refreshInterval } = body
    
    if (!dimension) {
      return NextResponse.json(
        { error: 'Missing dimension parameter' },
        { status: 400 }
      )
    }
    
    // Update configuration
    if (enabled !== undefined) {
      config.dimensions[dimension].enabled = enabled
    }
    
    if (refreshInterval !== undefined) {
      config.dimensions[dimension].refreshInterval = refreshInterval
    }
    
    return NextResponse.json({
      success: true,
      message: `Dimension '${dimension}' configuration updated`,
      dimension,
      config: config.dimensions[dimension]
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update dimension configuration', details: error },
      { status: 500 }
    )
  }
}

// Delete dimension
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const dimension = url.searchParams.get('dimension')
    
    if (!dimension) {
      return NextResponse.json(
        { error: 'Missing dimension parameter' },
        { status: 400 }
      )
    }
    
    // Disable the dimension
    if (config.dimensions[dimension]) {
      config.dimensions[dimension].enabled = false
    }
    
    return NextResponse.json({
      success: true,
      message: `Dimension '${dimension}' disabled`,
      dimension
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to disable dimension', details: error },
      { status: 500 }
    )
  }
}

// Get all dimensions and their status
export async function OPTIONS(request: NextRequest) {
  try {
    const dimensions = Object.entries(config.dimensions).map(([key, config]) => ({
      dimension: key,
      enabled: config.enabled,
      sourceTable: config.sourceTable,
      sourceColumn: config.sourceColumn,
      masterTable: config.masterTable,
      refreshInterval: config.refreshInterval
    }))
    
    return NextResponse.json({
      dimensions,
      totalDimensions: dimensions.length,
      enabledDimensions: dimensions.filter(d => d.enabled).length,
      agentStatus: masterToggleAgent.getHealth()
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get dimensions status', details: error },
      { status: 500 }
    )
  }
}