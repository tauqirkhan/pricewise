import mongoose from "mongoose"

let isConnected = false

export const connectToDB = async () => {
    // Not required anymore: 
    // mongoose.set('strictQuery', true)

    if(!process.env.MONGO_URI) 
        return console.log('MONGO_URI is not defined')

    if(isConnected) 
        return console.log('Using Existing Database Connection')

    try {
        await mongoose.connect(process.env.MONGO_URI)

        isConnected = true

        console.log('MongoDB Connected')
    } catch (error) {
        console.log(error)
    }
}