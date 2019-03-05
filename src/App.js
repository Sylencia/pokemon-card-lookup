import React, { Component } from 'react'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import _omit from 'lodash/omit'
import _mapKeys from 'lodash/mapKeys'
import cardSDK from 'pokemontcgsdk'
import './App.css';

class App extends Component {
  state = {
    searchParams: {},
    searchData: [],
    searchDisabled: true,
    sets: [],
  }

  componentDidMount() {
    cardSDK.set.where({})
    .then(set => {
        console.log(set)
        this.setState({ sets: set, searchDisabled: false })
    })
  }

  splitStringToKeywords = (str) => {
    return str.match(/\\?.|^$/g).reduce((p, c) => {
          if(c === '"'){
              p.quote ^= 1;
          }else if(!p.quote && c === ' '){
              p.a.push('');
          }else{
              p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
          }
          return  p;
      }, {a: ['']}).a
  }

  onInputChange = (event) => {
    const inputStr = event.target.value.trim()
    const keywords = this.splitStringToKeywords(inputStr)
    const searchParams = {
      nameArray: []
    }
    _map(keywords, (str) => {
      // Set Code
      if (_startsWith(str, 's:') || _startsWith(str, 'set:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if(cleanedStr !== '') {
          searchParams.setCode = cleanedStr
        }
      } else if (_startsWith(str, 'a:') || _startsWith(str, 'artist:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if(cleanedStr !== '') {
          searchParams.artist = cleanedStr
        }
      } else if (_startsWith(str, 'f:') || _startsWith(str, 'format:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if(cleanedStr !== '') {
          searchParams.format = cleanedStr
        }
      } else {
        if(str !== '') {
          searchParams.nameArray.push(str)
        }
      }
    })

    if(searchParams.nameArray.length > 0) {
      searchParams.name = searchParams.nameArray.join()
    }
    
    this.setState({
      searchParams,
    })
  }

  onSubmit = () => {
    const {sets, searchParams} = this.state
    const cleanedSearchParams = _omit(searchParams, ['nameArray', 'format'])
    cardSDK.card.where(cleanedSearchParams).then(cards => {
      // Sort the cards found based off release date
      const sortedCards = cards.sort((a, b) => {
        // If the set is the same, then sort by number
        if (a.setCode === b.setCode) {
          return a.number - b.number
        }

        // Otherwise sort by release date
        const aRelease = new Date(sets.find(set => set.code === a.setCode).releaseDate)
        const bRelease = new Date(sets.find(set => set.code === b.setCode).releaseDate)
        return bRelease - aRelease
      })

      const formatCheck = {
        'standard': card => sets.find(set => set.code === card.setCode).standardLegal,
        'expanded': card => sets.find(set => set.code === card.setCode).expandedLegal
      }[searchParams.format] || (card => true)

      const filteredCards = sortedCards.filter(formatCheck)

      this.setState({
        searchData: filteredCards,
      })
    })
  }

  render() {
    const { searchParams, searchData } = this.state

    const paramsToUse = _omit(searchParams, 'name')
    const displayedParams = []
    const displayedImages = []
    _mapKeys(paramsToUse, (value, key) => {
      if(key === 'setCode') {
        displayedParams.push(<div>Set is {value}</div>)
      } else if (key === 'artist') {
        displayedParams.push(<div>Artist name contains {value}</div>)
      } else if (key === 'format') {
        displayedParams.push(<div>Legal in {value}</div>)
      } else if (key === 'nameArray' && value.length > 0) {
        let nameStr = 'Name contains '
        value.map((str, index) => index
          ? nameStr += `, ${str}` 
          : nameStr += `${str}`)

        displayedParams.push(<div>{nameStr}</div>)
      }
    })

    searchData.map(card => {
      if(card.imageUrl) {
        displayedImages.push(<img src={card.imageUrl} alt="pokemon"/>)
      }

      return true
    })

    return (
      <div className="App">
        <header className="App-header">
          <input 
            type="text"
            name="card"
            onChange={this.onInputChange} 
          />
          <button onClick={this.onSubmit} disabled={this.state.searchDisabled}>submit</button>
          {displayedParams}
          <div className="images">{displayedImages}</div>
        </header>
      </div>
    );
  }
}

export default App;
