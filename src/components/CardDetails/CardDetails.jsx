import React, { Fragment } from 'react'
import styles from './CardDetails.module.scss'

export const CardDetails = ({ data }) => {
  return (
    <div className={styles.detailsContainer}>
      <img src={data.imageUrl} alt={`${data.name} (${data.id})`} />
      <div>
        <h5>{data.name}</h5>
        {data.hp && <span>{data.hp} HP</span>}
      </div>
    </div>
  )
}
