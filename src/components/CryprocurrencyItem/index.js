import React, {useEffect, useState, memo} from 'react'
import '../CryptocurrenciesList/index.css'

const CryptocurrencyItem = memo(({content}) => {
  const {currencyLogo, usdValue, currencyName, euroValue, inrValue, usdDelta, eurDelta, inrDelta} = content

  const [flashUsd, setFlashUsd] = useState(false)
  const [flashEur, setFlashEur] = useState(false)
  const [flashInr, setFlashInr] = useState(false)

  useEffect(() => {
    if (usdDelta && Math.abs(usdDelta) > 0) {
      setFlashUsd(true)
      const t = setTimeout(() => setFlashUsd(false), 400)
      return () => clearTimeout(t)
    }
    return undefined
  }, [usdDelta])

  useEffect(() => {
    if (eurDelta && Math.abs(eurDelta) > 0) {
      setFlashEur(true)
      const t = setTimeout(() => setFlashEur(false), 400)
      return () => clearTimeout(t)
    }
    return undefined
  }, [eurDelta])

  useEffect(() => {
    if (inrDelta && Math.abs(inrDelta) > 0) {
      setFlashInr(true)
      const t = setTimeout(() => setFlashInr(false), 400)
      return () => clearTimeout(t)
    }
    return undefined
  }, [inrDelta])

  const fmt = (value, maximumFractionDigits = 2) => {
    try {
      return new Intl.NumberFormat(undefined, {
        maximumFractionDigits,
        minimumFractionDigits: 2,
      }).format(Number(value))
    } catch (e) {
      return Number(value).toFixed(2)
    }
  }

  const deltaFormat = (d) => {
    if (!d) return ''
    const symbol = d > 0 ? '▲' : '▼'
    return `${symbol}${Math.abs(d) >= 1 ? fmt(d, 2) : Number(d).toFixed(6)}`
  }

  return (
    <li className="bgForLi">
      <div className="full-item">
        <div className="full-item1 left">
          <img src={currencyLogo} alt={currencyName} className="logo" />
          <div>
            <p className="para bold">{currencyName}</p>
          </div>
        </div>
        <div className="full-item1 right">
          <p className={`para ${flashUsd ? 'flash' : ''}`}>
            <span className="price-value">${fmt(usdValue)}</span> <span className={usdDelta > 0 ? 'delta-up' : usdDelta < 0 ? 'delta-down' : ''}>{deltaFormat(usdDelta)}</span>
          </p>
          <p className={`para ${flashEur ? 'flash' : ''}`}>
            <span className="price-value">€{fmt(euroValue)}</span> <span className={eurDelta > 0 ? 'delta-up' : eurDelta < 0 ? 'delta-down' : ''}>{deltaFormat(eurDelta)}</span>
          </p>
          <p className={`para ${flashInr ? 'flash' : ''}`}>
            <span className="price-value">₹{fmt(inrValue)}</span> <span className={inrDelta > 0 ? 'delta-up' : inrDelta < 0 ? 'delta-down' : ''}>{deltaFormat(inrDelta)}</span>
          </p>
        </div>
      </div>
    </li>
  )
})

CryptocurrencyItem.displayName = 'CryptocurrencyItem'

export default CryptocurrencyItem
