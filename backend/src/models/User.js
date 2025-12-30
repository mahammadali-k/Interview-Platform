import mangoose from 'mongoose';

const userSchema = new mangoose.Schema({
    username: {
         type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    profileImage: { 
        type: String ,
        default: ''
    },
    clerkId:{
        type: String,
        required: true,
        unique: true,
    },

    
},
{timestamps: true} // Automatically manage createdAt and updatedAt fields


);

//member since we are using mongoose model in other files

const User = mangoose.model('User', userSchema);


export default User;