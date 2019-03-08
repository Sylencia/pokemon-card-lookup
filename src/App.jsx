import React, { Component } from 'react'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'
import _omit from 'lodash/omit'
import _mapKeys from 'lodash/mapKeys'
import _includes from 'lodash/includes'
import cardSDK from 'pokemontcgsdk'
import styles from './App.module.scss'

import Card from './Card'

class App extends Component {
  state = {
    searchParams: {
      name: [],
    },
    searchData: [],
    searchDisabled: true,
    sets: [],
  }

  componentDidMount() {
    cardSDK.set.where({})
      .then(set => {
        this.setState({ sets: set })
      })
  }

  splitStringToKeywords = (str) => {
    return str.match(/\\?.|^$/g).reduce((p, c) => {
      if (c === '"') {
        p.quote ^= 1
      } else if (!p.quote && c === ' ') {
        p.a.push('')
      } else {
        p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1')
      }
      return p
    }, { a: [''] }).a
  }

  onInputChange = (event) => {
    const inputStr = event.target.value.trim().toLowerCase()
    const keywords = this.splitStringToKeywords(inputStr)
    const searchParams = {
      name: [],
      rarity: [],
    }
    let invalidInput = false

    _map(keywords, (str) => {
      // Set Code
      if (_startsWith(str, 's:') || _startsWith(str, 'set:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if (cleanedStr !== '') {
          searchParams.setCode = cleanedStr
        }
      // Artist
      } else if (_startsWith(str, 'a:') || _startsWith(str, 'artist:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if (cleanedStr !== '') {
          searchParams.artist = cleanedStr
        }
      // Format
      } else if (_startsWith(str, 'f:') || _startsWith(str, 'format:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if (_includes(['standard', 'expanded'], cleanedStr)) {
          searchParams.format = cleanedStr
        } else if (cleanedStr !== '') {
          searchParams.format = 'invalid format'
          invalidInput = true
        }
      // Rarity
      } else if (_startsWith(str, 'r:') || _startsWith(str, 'rarity:')) {
        const cleanedStr = str.substring(str.indexOf(':') + 1)
        if (_includes(['common', 'uncommon', 'rare', ''], cleanedStr)) {
          searchParams.format = cleanedStr
        } else if (cleanedStr !== '') {
          searchParams.format = 'invalid format'
          invalidInput = true
        }
      } else {
        if (str !== '') {
          searchParams.name.push(str)
        }
      }
    })

    this.setState({
      searchParams,
      searchDisabled: invalidInput,
    })
  }

  onSubmit = () => {
    const { sets, searchParams } = this.state
    const cleanedSearchParams = _omit(searchParams, ['name', 'format'])
    cleanedSearchParams.name = searchParams.name.join()

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
        'expanded': card => sets.find(set => set.code === card.setCode).expandedLegal,
      }[searchParams.format] || (card => true)

      const filteredCards = sortedCards.filter(formatCheck)

      this.setState({
        searchData: filteredCards,
      })
    })
  }

  render() {
    const { searchParams, searchData, searchDisabled } = this.state

    const displayedParams = []
    const displayedImages = []
    _mapKeys(searchParams, (value, key) => {
      if (key === 'setCode') {
        displayedParams.push(
          <code>
            <span className={styles.parameter}>set</span>
            {' is '}
            <span className="value">{value}</span>
          </code>
        )
      } else if (key === 'artist') {
        displayedParams.push(
          <code>
            <span className={styles.parameter}>artist name</span>
            {' contains '}
            <span className="value">{value}</span>
          </code>
        )
      } else if (key === 'format') {
        if (value === 'invalid') {
          displayedParams.push(
            <code>
              <span className={styles.invalidValue}>invalid format legality</span>
            </code>
          )
        } else {
          displayedParams.push(
            <code>
              <span className={styles.parameter}>legal</span>
              {' in '}
              <span className="value">{value}</span>
            </code>)
        }
      } else if (key === 'name' && value.length > 0) {
        let nameStr = ''
        value.map((str, index) => {
          index
            ? nameStr += `, ${str}`
            : nameStr += `${str}`
        })

        displayedParams.push(
          <div>
            <span className={styles.parameter}>name</span>
            { ' contains ' }
            <span className="value">{nameStr}</span>
          </div>
        )
      }
    })

    searchData.map(card => {
      if (card.imageUrl) {
        displayedImages.push(<img src={card.imageUrl} alt={`${card.name} (${card.id})`} />)
      }

      return true
    })

    return (
      <div className={styles.app}>
        <input
          type="text"
          name="card"
          onChange={this.onInputChange}
        />
        <button type="submit" onClick={this.onSubmit} disabled={searchDisabled}>submit</button>
        {displayedParams}
        <div className="images">{displayedImages}</div>
        <Card />
      </div>
    )
  }
}

export default App
