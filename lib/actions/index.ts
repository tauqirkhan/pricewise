"use server"

import { revalidatePath } from "next/cache";
import Product from "../../models/product.model";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../scraper/mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(productUrl: string){
    if(!productUrl) return;

    try {  
        await connectToDB()
  
        const scrapeProduct = await scrapeAmazonProduct(productUrl)

        if(!scrapeProduct) return

        let product = scrapeProduct

        const existingProduct = await Product.findOne({ url: scrapeProduct.url })

        if(existingProduct) {
            const updatedPriceHistory = [
                ...existingProduct.priceHistory,
                { price: scrapeProduct.currentPrice}
            ]

            product = {
                ...scrapeProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory)
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapeProduct.url },
            product,
            { upsert: true, new: true }
        )

        revalidatePath(`/products/${newProduct._id}`)
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
} 

export async function getProductById(productId: string){
    try {
        await connectToDB()

        const product = await Product.findOne({_id: productId})

        if(!product) return null

        return product
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
}

export async function getAllProducts() {
    try {
        await connectToDB()

        const products = await Product.find()

        return products
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
}

export async function getSimilarProducts(productId: string) {
    try {
        await connectToDB()

        const currentProduct = await Product.findById(productId)

        if(!currentProduct) return null

        const similarProducts = await Product.find({
            _id: {$ne: productId},
            category: currentProduct.category
        }).limit(3)

        return similarProducts
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to create/update product: ${errorMessage}`)
    }
}

export async function addUserEmailToProduct(productId: string, email: string){
    console.log("addUserEmailToProduct")
}