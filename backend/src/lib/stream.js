import {StreamChat} from 'stream-chat';
import {ENV} from './env.js';

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;



if (!apiKey || !apiSecret) {
    console.error('Stream API key or stream api secret is missing. Please set STREAM_API_KEY and STREAM_API_SECRET in your environment variables.');
}


export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try{
        await chatClient.upsertUser(userData)
        console.log("Stream user upserted succesfully:",userData)
    }catch(error){
        console.error('Error upserting stream user:', error);
    }
}

export const deleteStreamUser = async (userId) => {
    try{
        await chatClient.deleteUser(userId, { markMessagesDeleted: true });
        console.log("Stream user deleted succesfully:",userId)
    }catch(error){
        console.error('Error deleting the stream user:', error);
    }
}   


// another method generate user token