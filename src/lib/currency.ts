export interface ExchangeRate {
  Cur_ID: number
  Date: string
  Cur_Abbreviation: string
  Cur_Scale: number
  Cur_Name: string
  Cur_OfficialRate: number
}

export interface CurrencyInfo {
  code: string
  name: string
  rate: number
  scale: number
}

const MAJOR_CURRENCIES = ['USD', 'EUR', 'RUB', 'PLN', 'CNY', 'GBP', 'CHF', 'CZK', 'UAH', 'KZT']

export async function getExchangeRates(): Promise<CurrencyInfo[]> {
  try {
    const response = await fetch(
      'https://www.nbrb.by/api/exrates/rates?periodicity=0',
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error(`NBRB API error: ${response.status}`)
    }

    const rates: ExchangeRate[] = await response.json()
    
    return rates
      .filter(rate => MAJOR_CURRENCIES.includes(rate.Cur_Abbreviation))
      .map(rate => ({
        code: rate.Cur_Abbreviation,
        name: rate.Cur_Name,
        rate: rate.Cur_OfficialRate,
        scale: rate.Cur_Scale,
      }))
      .sort((a, b) => MAJOR_CURRENCIES.indexOf(a.code) - MAJOR_CURRENCIES.indexOf(b.code))
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return []
  }
}

export async function getAllExchangeRates(): Promise<CurrencyInfo[]> {
  try {
    const response = await fetch(
      'https://www.nbrb.by/api/exrates/rates?periodicity=0',
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error(`NBRB API error: ${response.status}`)
    }

    const rates: ExchangeRate[] = await response.json()
    
    return rates.map(rate => ({
      code: rate.Cur_Abbreviation,
      name: rate.Cur_Name,
      rate: rate.Cur_OfficialRate,
      scale: rate.Cur_Scale,
    }))
  } catch (error) {
    console.error('Error fetching all exchange rates:', error)
    return []
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyInfo[]
): number {
  const BYN = 'BYN'
  
  if (fromCurrency === toCurrency) return amount
  
  // Convert to BYN first
  let amountInBYN: number
  
  if (fromCurrency === BYN) {
    amountInBYN = amount
  } else {
    const fromRate = rates.find(r => r.code === fromCurrency)
    if (!fromRate) return 0
    amountInBYN = (amount * fromRate.rate) / fromRate.scale
  }
  
  // Convert from BYN to target currency
  if (toCurrency === BYN) {
    return amountInBYN
  }
  
  const toRate = rates.find(r => r.code === toCurrency)
  if (!toRate) return 0
  
  return (amountInBYN * toRate.scale) / toRate.rate
}
