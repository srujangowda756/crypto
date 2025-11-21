import {Component} from 'react'
import {Rings} from 'react-loader-spinner'
import CryptocurrencyItem from '../CryprocurrencyItem'

import './index.css'

class CryptocurrenciesList extends Component {
  state = {cryptos: [], isLoading: true}

  componentDidMount() {
    this.init()
  }

  init=()=>{
    this.intervalId = setInterval(this.fetchDetails, 1000)
  }
  componentWillUnmount(){
    clearInterval(this.intervalId)
  }

  fetchDetails = async () => {
    const response = await fetch(
      'https://apis.ccbp.in/crypto-currency-converter',
    )
    const data = await response.json()

    const formatted = data.map(each => ({
      id: each.id,
      currencyName: each.currency_name,
      usdValue: each.usd_value,
      euroValue: each.euro_value,
      currencyLogo: each.currency_logo,
    }))

    this.setState({cryptos: formatted, isLoading: false})
  }

  render() {
    const {cryptos, isLoading} = this.state

    return (
      <div className="overall">
        {isLoading ? (
          <div data-testid="loader">
            <Rings color="#ffffff" height={80} width={80} />
          </div>
        ) : (
          <div className="card">
            <h1 className="heading">Cryptocurrency Tracker</h1>

            <img
              src="https://assets.ccbp.in/frontend/react-js/cryptocurrency-bg.png"
              alt="cryptocurrency"
            />

            <div className="cont">
              <div className="classHeadings rowFlex">
                <div className="rowFlex">
                  <p className="para">Coin</p>
                  <p className="para">Type</p>
                </div>
                <div className="rowFlex">
                  <p className="para">USD</p>
                  <p className="para">EURO</p>
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
