import React from 'react'
import Image from 'next/image'

type Props = {
    title: string,
    iconSrc: string,
    value: string,
}

const PriceInfoCart = ({ title, iconSrc, value}: Props) => {
  return (
    <div className={`price-info_card`}>
        <p className='text-base text-black'>{title}</p>

        <div className='flex gap-1'>
            <Image 
                src={iconSrc}
                alt={title}
                width={24}
                height={24}
            />

            <p className='text-2xl font-bold text-secondary'>{value}</p>
        </div>
    </div>
  )
}   

export default PriceInfoCart