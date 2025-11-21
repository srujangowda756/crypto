import '../CryptocurrenciesList/index.css'

const CryptocurrencyItem = ({content}) => {
  const {currencyLogo, usdValue, currencyName, euroValue} = content
  return (
    <li className="bgForLi">
      <div className="full-item">
        <div className="full-item1">
          <img src={currencyLogo} alt={currencyName} className="logo" />
          <p className="para">{currencyName}</p>
        </div>
        <div className="full-item1">
          <p className="para">{usdValue}</p>
          <p className="para">{euroValue}</p>
        </div>
      </div>
    </li>
  )
}

export default CryptocurrencyItem
