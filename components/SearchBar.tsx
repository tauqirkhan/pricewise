"use client"

import { parse } from 'path'
import React, { FormEvent, useState } from 'react'
import { scrapeAndStoreProduct } from '../lib/actions'
import { Cheerio } from 'cheerio'

const isValidAmazonProductURL = (url: string): boolean => {
    try {
        const parseUrl = new URL(url)
        const hostname = parseUrl.hostname

        if(
            hostname.includes('amazon.com') ||
            hostname.includes('amazon.') ||
            hostname.startsWith('amazon')
        ) {
            return true;
        }
        
    } catch (error) {
        return false;
    }

    return false;
}

const SearchBar = () => {
    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsloading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValidLink = isValidAmazonProductURL(searchPrompt)

        if(!isValidLink) return alert('Please provide a valid Amazon link')

        try {
            setIsloading(true)

            //  Scrape the product page
            const product = await scrapeAndStoreProduct(searchPrompt)
                        
        } catch (error) {
            console.error(error)
        } finally {
            setIsloading(false)
        }
    }

    return (
            <form 
                className='flex flex-wrap gap-4 mt-12'
                onSubmit={handleSubmit}
            >
                <input 
                    type="text"
                    placeholder='Enter product link'
                    className='searchbar-input'
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    value={searchPrompt}
                />

                <button    
                    type='submit' 
                    className='searchbar-btn'
                    disabled={searchPrompt === ''}    
                >
                    {isLoading ? 'Searching...': 'Search'}
                </button>
            </form>
        )
}

export default SearchBar