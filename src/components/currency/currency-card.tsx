"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowRight, RefreshCw, DollarSign, TrendingUp, Crown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CurrencyInfo } from "@/lib/currency"
import { convertCurrency } from "@/lib/currency"

interface CurrencyCardProps {
  rates: CurrencyInfo[]
  allRates: CurrencyInfo[]
  loading: boolean
  onRefresh: () => void
  isPremium: boolean
}

export function CurrencyCard({ rates, allRates, loading, onRefresh, isPremium }: CurrencyCardProps) {
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BYN")
  const [amount, setAmount] = useState("100")
  const [displayRates, setDisplayRates] = useState<CurrencyInfo[]>(rates)

  useEffect(() => {
    setDisplayRates(isPremium ? allRates : rates)
  }, [isPremium, allRates, rates])

  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount) || 0
    return convertCurrency(numAmount, fromCurrency, toCurrency, displayRates)
  }, [amount, fromCurrency, toCurrency, displayRates])

  const currencyOptions = useMemo(() => {
    const options = [{ code: "BYN", name: "Belarusian Ruble" }]
    displayRates.forEach((rate) => {
      options.push({ code: rate.code, name: rate.name })
    })
    return options
  }, [displayRates])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const exportCsv = () => {
    const header = "Currency,Code,Rate (BYN),Scale\n"
    const rows = displayRates
      .map((r) => `"${r.name.replace(/"/g, '""')}",${r.code},${r.rate},${r.scale}`)
      .join("\n")
    const csv = header + rows
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `exchange-rates-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Exchange
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Exchange
          </span>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <Badge variant="outline" className="text-xs">
                Major currencies only
              </Badge>
            )}
            {isPremium && (
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          National Bank of the Republic of Belarus • {formatDate(new Date())}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-medium">Currency Converter</h4>
          <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <div className="flex items-end justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex h-10 items-center rounded-md border bg-background px-3">
                <span className="font-medium">
                  {convertedAmount.toFixed(2)} {toCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Exchange Rates (vs BYN)</h4>
            {!isPremium && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help">
                      <Crown className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upgrade to see all currencies</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Rate (BYN)</TableHead>
                  <TableHead className="text-right">Scale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRates.slice(0, isPremium ? undefined : 10).map((rate) => (
                  <TableRow key={rate.code}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rate.code}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {rate.rate.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {rate.scale}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
