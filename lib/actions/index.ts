"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productUrl: string){
    if(!productUrl) return;

    try {     
        const scrapeProduct = await scrapeAmazonProduct(productUrl)

        if(!scrapeProduct) return

        
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
}