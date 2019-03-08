import React, { useState } from 'react'
import PropTypes from 'prop-types'

export const SearchBox = ({ onChange }) => {
  const [inputValue, setInputValue] = useState()

  const handleChange = event => {
    const value = event.target.value

    setInputValue(value)
    onChange(value)
  }

  return <input type="text" value={inputValue} onChange={handleChange} />
}

SearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
}
