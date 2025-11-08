import { NextResponse } from "next/server"
import { generateEmailBody, sendEmail } from "../../../../lib/nodemailer"
import { scrapeAmazonProduct } from "../../../../lib/scraper"
import { connectToDB } from "../../../../lib/scraper/mongoose"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "../../../../lib/utils"
import Product from "../../../../models/product.model"
import { User } from "../../../../types"

export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        connectToDB()

        const products = await Product.find({})

        if(!products) throw new Error("No Products Found")

        // Scrape The Latest Product Details & Update DB
        const updatedProducts = await Promise.all(
            products.map(async( currentProduct) => {
                const scrapeProduct = await scrapeAmazonProduct(currentProduct.url)

                if(!scrapeProduct) return

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    { price: scrapeProduct.currentPrice}
                ]

                const product = {
                    ...scrapeProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory)
                }
                

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product, 
                )

                // Check Each Product's Status & Send Email Accordingly
                const emailNotifType = getEmailNotifType(scrapeProduct, currentProduct)

                if(emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url
                    }

                    const emailContent = await generateEmailBody(productInfo, emailNotifType)


                    const userEmails = updatedProduct.users.map((user: User) => user.email)

                    await sendEmail(emailContent, userEmails)
                }

                return updatedProduct
            })
        )

        return NextResponse.json({
            message: 'Ok',
            data: updatedProducts
        })
        
    } catch (error: unknown) {
        let errorMessage = "Something Went Wrong!!!"

        if(error instanceof Error) 
            errorMessage = error.message

        throw new Error(`Failed to get all products: ${errorMessage}`)
    }
}