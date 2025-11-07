import axios from "axios"
import * as cheerio from "cheerio"
import { extractCurrency, extractDescription, extractPrice } from "../utils"
import { PriceHistoryItem } from "../../types"

export async function scrapeAmazonProduct(url: string){
    if(!url) return

    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false
    }

    try {
        
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)

        // Extract the product title
        const title = $('#productTitle').text().trim()

        const currentPrice = extractPrice(
            $('a.size.base.a-color-price'),
            $('.priceToPay span.a-price-whole'),
            $('.a-button-selected .a-color-base'),
        )

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = ($('#availability span').text().trim().toLowerCase() === 'currently unavailable');

        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') || 
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'

        const imageUrls = Object.keys(JSON.parse(images))

        const currency = extractCurrency($('.a-price-symbol'))

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "")

        const categoryCollection = $('.a-link-normal.a-color-tertiary')
        //always give second last subcategory
        const category = categoryCollection.eq(categoryCollection.length - 2).text().trim()

        const ratingCount = $('#acrCustomerReviewText.a-size-base').eq(0).text().replace(/[^\d.]/g, '')

        const ratingStars = $('#acrPopover .a-size-base.a-color-base').eq(0).text().trim()

        const description = extractDescription($)
        
        // console.log("title: ", title)
        // console.log("currentPrice: ", currentPrice)
        // console.log("originalPrice: ", originalPrice)
        // console.log("outOfStock: ", outOfStock)
        // console.log("imagesUrl: ", imageUrls)
        // console.log("currency", currency)
        // console.log("discountRate: ", discountRate, "%")
        // console.log("category: ", category)
        // console.log("ratingCount: ", ratingCount)
        // console.log("ratingStars: ", ratingStars)

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [] as PriceHistoryItem[],
            discountRate: Number(discountRate),
            category,
            ratingCount,
            ratingStars,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice)
        }

        return data

    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
}