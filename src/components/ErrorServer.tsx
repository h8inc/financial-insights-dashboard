'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  EyeOff,
  Clock,
  FileText,
  Code,
  Bug,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info' | 'debug'
  message: string
  stack?: string
  component?: string
  file?: string
  line?: number
  column?: number
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  resolved: boolean
  tags: string[]
}

interface ErrorServerProps {
  className?: string
}

export const ErrorServer: React.FC<ErrorServerProps> = ({ className = '' }) => {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [resolvedFilter, setResolvedFilter] = useState<string>('all')
  const [showResolved, setShowResolved] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with mock data
  useEffect(() => {
    const mockErrors: ErrorLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        level: 'error',
        message: 'TypeError: Cannot read property "value" of undefined',
        stack: 'at ChartVisualization.renderD3Chart (ChartVisualization.tsx:109:15)\nat React.createElement (react-dom.js:1234:56)',
        component: 'ChartVisualization',
        file: 'src/components/charts/ChartVisualization.tsx',
        line: 109,
        column: 15,
        userId: 'user-123',
        sessionId: 'session-456',
        url: '/charts/cash-flow',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        resolved: false,
        tags: ['d3', 'chart', 'rendering']
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        level: 'warning',
        message: 'D3 scale domain is empty, using fallback values',
        component: 'D3BaseChart',
        file: 'src/components/charts/D3BaseChart.tsx',
        line: 45,
        column: 8,
        userId: 'user-789',
        sessionId: 'session-101',
        url: '/charts/profit',
        resolved: false,
        tags: ['d3', 'scale', 'data']
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        level: 'error',
        message: 'Failed to load chart data: Network timeout',
        component: 'useChartData',
        file: 'src/hooks/useChartData.ts',
        line: 152,
        column: 3,
        userId: 'user-456',
        sessionId: 'session-789',
        url: '/charts/revenue',
        resolved: true,
        tags: ['network', 'data', 'timeout']
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        level: 'info',
        message: 'Chart data loaded successfully',
        component: 'ChartVisualization',
        file: 'src/components/charts/ChartVisualization.tsx',
        line: 75,
        column: 12,
        userId: 'user-321',
        sessionId: 'session-654',
        url: '/charts/expenses',
        resolved: true,
        tags: ['success', 'data']
      }
    ]
    setErrors(mockErrors)
    setFilteredErrors(mockErrors)
  }, [])

  // Filter errors based on search and filters
  useEffect(() => {
    let filtered = errors

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(error => 
        error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.file?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(error => error.level === levelFilter)
    }

    // Resolved filter
    if (resolvedFilter === 'resolved') {
      filtered = filtered.filter(error => error.resolved)
    } else if (resolvedFilter === 'unresolved') {
      filtered = filtered.filter(error => !error.resolved)
    }

    // Show resolved filter
    if (!showResolved) {
      filtered = filtered.filter(error => !error.resolved)
    }

    setFilteredErrors(filtered)
  }, [errors, searchTerm, levelFilter, resolvedFilter, showResolved])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        // Simulate new errors
        const newError: ErrorLog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: Math.random() > 0.7 ? 'error' : 'warning',
          message: `Auto-generated ${Math.random() > 0.5 ? 'error' : 'warning'} ${Date.now()}`,
          component: 'ErrorServer',
          file: 'src/components/ErrorServer.tsx',
          line: Math.floor(Math.random() * 100) + 1,
          column: Math.floor(Math.random() * 50) + 1,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          sessionId: `session-${Math.floor(Math.random() * 1000)}`,
          url: '/error-server',
          resolved: false,
          tags: ['auto-generated', 'test']
        }
        setErrors(prev => [newError, ...prev])
      }, 10000) // Every 10 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh])

  const resolveError = (id: string) => {
    setErrors(prev => prev.map(error => 
      error.id === id ? { ...error, resolved: true } : error
    ))
  }

  const deleteError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }

  const clearAllResolved = () => {
    setErrors(prev => prev.filter(error => !error.resolved))
  }

  const exportErrors = () => {
    const dataStr = JSON.stringify(filteredErrors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-log-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <FileText className="h-4 w-4 text-blue-500" />
      case 'debug': return <Bug className="h-4 w-4 text-gray-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'default'
      case 'debug': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Error Monitoring Server
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>

            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
            >
              {showResolved ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllResolved}
              disabled={!errors.some(e => e.resolved)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Resolved
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportErrors}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Error Log ({filteredErrors.length})</span>
            <Badge variant="outline">
              {errors.filter(e => !e.resolved).length} unresolved
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredErrors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No errors found matching your criteria</p>
              </div>
            ) : (
              filteredErrors.map((error) => (
                <div
                  key={error.id}
                  className={`border rounded-lg p-4 ${
                    error.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getLevelIcon(error.level)}
                        <Badge variant={getLevelBadgeVariant(error.level)}>
                          {error.level.toUpperCase()}
                        </Badge>
                        {error.resolved && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {error.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">
                        {error.message}
                      </h4>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {error.component && (
                          <p><strong>Component:</strong> {error.component}</p>
                        )}
                        {error.file && (
                          <p><strong>File:</strong> {error.file}:{error.line}:{error.column}</p>
                        )}
                        {error.url && (
                          <p><strong>URL:</strong> {error.url}</p>
                        )}
                        {error.userId && (
                          <p><strong>User:</strong> {error.userId}</p>
                        )}
                        {error.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {error.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {error.stack && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                            <Code className="h-3 w-3 inline mr-1" />
                            Stack Trace
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!error.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveError(error.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteError(error.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
