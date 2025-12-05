import {Component} from 'react'
import {Rings} from 'react-loader-spinner'
import CryptocurrencyItem from '../CryprocurrencyItem'

import './index.css'

class CryptocurrenciesList extends Component {
  state = {cryptos: [], isLoading: true, source: 'CoinGecko', isRefreshing: false}

  abortController = null
  isFetching = false

  componentDidMount() {
    this.init()
  }

  init=()=>{
    // Poll every 3 seconds for smooth, responsive updates
    this.intervalId = setInterval(this.fetchDetails, 3000)
    // Fetch immediately as well
    this.fetchDetails()
  }
  
  componentWillUnmount(){
    clearInterval(this.intervalId)
    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  fetchDetails = async () => {
    // Prevent duplicate requests
    if (this.isFetching) {
      return
    }

    // Cancel previous request if still pending
    if (this.abortController) {
      this.abortController.abort()
    }

    // Create new AbortController for this request
    this.abortController = new AbortController()
    this.isFetching = true

    // Show subtle refreshing indicator (only if we have data) with slight delay to avoid flicker
    if (this.state.cryptos.length > 0) {
      // Use setTimeout to batch state updates and avoid blocking
      setTimeout(() => {
        if (!this.abortController?.signal.aborted) {
          this.setState({isRefreshing: true})
        }
      }, 100)
    }

    // Use CoinGecko as the sole data source (USD, EUR, INR)
    const base = 'https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&per_page=10&page=1&sparkline=false&vs_currency='
    const usdUrl = `${base}usd`
    const eurUrl = `${base}eur`
    const inrUrl = `${base}inr`

    try {
      const signal = this.abortController.signal
      
      // use no-cache to try to avoid cached responses
      const [usdResp, eurResp, inrResp] = await Promise.all([
        fetch(usdUrl, {cache: 'no-cache', signal}),
        fetch(eurUrl, {cache: 'no-cache', signal}),
        fetch(inrUrl, {cache: 'no-cache', signal}),
      ])

      // Check if request was aborted
      if (signal.aborted) {
        return
      }

      if (!usdResp.ok || !eurResp.ok || !inrResp.ok) throw new Error('CoinGecko fetch failed')

      const [usdData, eurData, inrData] = await Promise.all([
        usdResp.json(),
        eurResp.json(),
        inrResp.json(),
      ])

      // Check again after async operations
      if (signal.aborted) {
        return
      }

      // Optimize map creation
      const eurMap = new Map(eurData.map(item => [item.id, item.current_price]))
      const inrMap = new Map(inrData.map(item => [item.id, item.current_price]))

      const formatted = usdData.map(item => ({
        id: item.id,
        currencyName: item.name,
        usdValue: item.current_price,
        euroValue: eurMap.get(item.id) ?? 0,
        inrValue: inrMap.get(item.id) ?? 0,
        currencyLogo: item.image,
      }))

      // Optimize delta calculation with Map
      const prevMap = new Map(this.state.cryptos.map(it => [it.id, it]))

      const withDeltas = formatted.map(it => {
        const prev = prevMap.get(it.id)
        return {
          ...it,
          usdDelta: prev ? Number(it.usdValue) - Number(prev.usdValue) : 0,
          eurDelta: prev ? Number(it.euroValue) - Number(prev.euroValue) : 0,
          inrDelta: prev ? Number(it.inrValue) - Number(prev.inrValue) : 0,
        }
      })

      // Only update state if not aborted - React will batch updates automatically
      if (!signal.aborted) {
        this.setState({
          cryptos: withDeltas, 
          isLoading: false, 
          source: 'CoinGecko', 
          lastUpdated: Date.now(),
          isRefreshing: false
        })
      }
    } catch (e) {
      // Ignore abort errors
      if (e.name === 'AbortError') {
        return
      }

      // On fetch failure, do not clear existing data — keep previous values visible.
      // If there is no existing data, keep showing the loader until a successful fetch.
      // eslint-disable-next-line no-console
      console.warn('CoinGecko fetch failed, keeping previous data:', e.message)
      if (this.state.cryptos.length === 0) {
        this.setState({isLoading: false, isRefreshing: false})
      } else {
        this.setState({isRefreshing: false})
      }
    } finally {
      this.isFetching = false
    }
  }

  render() {
    const {cryptos, isLoading} = this.state

    return (
      <div className="overall">
        {isLoading ? (
          <div data-testid="loader">
            <Rings color="#00e7ff" height={100} width={100} />
          </div>
        ) : (
          <div className="card">
            <h1 className="heading">Cryptocurrency Tracker</h1>

            <div className="hero" aria-hidden="true" />

            <div className="cont">
              {this.state.source && (
                  <p className="para" style={{textAlign: 'center'}}>
                    Source: {this.state.source}
                    {this.state.isRefreshing && <span className="refreshing-indicator"> ⟳</span>}
                  </p>
                )}
                {this.state.lastUpdated && (
                  <div className="last-updated">Last updated: {new Date(this.state.lastUpdated).toLocaleTimeString()}</div>
                )}
              <div className="classHeadings rowFlex">
                <div className="rowFlex">
                  <p className="para">Coin</p>
                  <p className="para">Type</p>
                </div>
                <div className="rowFlex">
                  <p className="para">USD</p>
                  <p className="para">EURO</p>
                  <p className="para">INR</p>
                </div>
              </div>

              <ul>
                {cryptos.map(item => (
                  <CryptocurrencyItem key={item.id} content={item} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default CryptocurrenciesList
