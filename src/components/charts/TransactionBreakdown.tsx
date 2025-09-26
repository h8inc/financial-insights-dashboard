'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartType, Transaction } from '@/lib/types'
import { useChartDataConsumer } from '@/hooks/useChartDataConsumer'
// import { useAtom } from 'jotai'
// import { isLoadingAtom } from '@/lib/atoms'

interface TransactionBreakdownProps {
  type: ChartType
}

export const TransactionBreakdown = ({ type }: TransactionBreakdownProps) => {
  const { isLoading } = useChartDataConsumer()
  
  // Seeded random function for deterministic results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  // Generate mock transaction data based on chart type (deterministic)
  const generateMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = []
    const categories = getCategoriesForType(type)
    const baseAmount = getBaseAmountForType(type)
    
    // Use chart type as seed for consistent results
    const seed = type === ChartType.CASH_FLOW ? 1 : 
                 type === ChartType.PROFIT ? 2 : 
                 type === ChartType.EXPENSES ? 3 : 4
    
    // Generate fixed number of transactions based on type
    const numTransactions = 12 + (seed * 2) // 14, 16, 18, 20 transactions
    
    for (let i = 0; i < numTransactions; i++) {
      const categoryIndex = Math.floor(seededRandom(seed * 100 + i) * categories.length)
      const category = categories[categoryIndex]
      
      const amountVariation = seededRandom(seed * 200 + i) * 0.3 + 0.1
      const amount = Math.floor(baseAmount * amountVariation)
      
      const date = new Date()
      const daysBack = Math.floor(seededRandom(seed * 300 + i) * 30)
      date.setDate(date.getDate() - daysBack)
      
      transactions.push({
        id: `txn-${type}-${i + 1}`,
        date: date.toISOString().split('T')[0],
        amount: amount,
        description: generateDescription(category, type),
        category: category,
        type: getTransactionType(type, category)
      })
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  
  const getCategoriesForType = (type: ChartType): string[] => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return ['Sales', 'Payments', 'Investments', 'Loans', 'Refunds', 'Fees']
      case ChartType.PROFIT:
        return ['Revenue', 'Cost of Goods', 'Operating Expenses', 'Taxes', 'Interest']
      case ChartType.EXPENSES:
        return ['Office Supplies', 'Marketing', 'Salaries', 'Utilities', 'Travel', 'Software']
      case ChartType.REVENUE:
        return ['Product Sales', 'Service Revenue', 'Subscriptions', 'Consulting', 'Licensing']
      default:
        return ['General']
    }
  }
  
  const getBaseAmountForType = (type: ChartType): number => {
    switch (type) {
      case ChartType.CASH_FLOW:
        return 5000
      case ChartType.PROFIT:
        return 3000
      case ChartType.EXPENSES:
        return 2000
      case ChartType.REVENUE:
        return 8000
      default:
        return 1000
    }
  }
  
  const generateDescription = (category: string, type: ChartType): string => {
    const descriptions = {
      [ChartType.CASH_FLOW]: {
        'Sales': 'Customer payment received',
        'Payments': 'Vendor payment processed',
        'Investments': 'Investment return',
        'Loans': 'Loan disbursement',
        'Refunds': 'Customer refund issued',
        'Fees': 'Transaction fee'
      },
      [ChartType.PROFIT]: {
        'Revenue': 'Monthly revenue recognition',
        'Cost of Goods': 'Product manufacturing cost',
        'Operating Expenses': 'General operating expense',
        'Taxes': 'Tax payment',
        'Interest': 'Interest expense'
      },
      [ChartType.EXPENSES]: {
        'Office Supplies': 'Office equipment purchase',
        'Marketing': 'Marketing campaign cost',
        'Salaries': 'Employee salary payment',
        'Utilities': 'Monthly utility bill',
        'Travel': 'Business travel expense',
        'Software': 'Software subscription'
      },
      [ChartType.REVENUE]: {
        'Product Sales': 'Product sale transaction',
        'Service Revenue': 'Service delivery payment',
        'Subscriptions': 'Monthly subscription revenue',
        'Consulting': 'Consulting service fee',
        'Licensing': 'Software licensing fee'
      }
    }
    
    return (descriptions[type] as Record<string, string>)?.[category] || 'General transaction'
  }
  
  const getTransactionType = (type: ChartType, category: string): 'income' | 'expense' => {
    const incomeCategories: Record<ChartType, string[]> = {
      [ChartType.CASH_FLOW]: ['Sales', 'Investments', 'Refunds'],
      [ChartType.PROFIT]: ['Revenue'],
      [ChartType.EXPENSES]: [],
      [ChartType.REVENUE]: ['Product Sales', 'Service Revenue', 'Subscriptions', 'Consulting', 'Licensing']
    }
    
    return incomeCategories[type]?.includes(category) ? 'income' : 'expense'
  }
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const mockTransactions = generateMockTransactions()
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center flex-1">
                    <div className="h-8 w-8 bg-gray-200 rounded mr-3" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Breakdown</CardTitle>
        <div className="text-sm text-gray-500">
          Recent transactions for {type.replace('-', ' ')} analysis
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {transaction.description}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatValue(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Transactions:</span>
            <span className="font-medium">{mockTransactions.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">
              {formatValue(mockTransactions.reduce((sum, txn) => 
                sum + (txn.type === 'income' ? txn.amount : -txn.amount), 0
              ))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

