//create user api app
const exp=require('express');
const userApp=exp.Router();
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
require('dotenv').config()
const cors = require('cors');
//const commonApp=require('./common-api')

let usercollection;

userApp.use(cors());

//get usercollection app
userApp.use((req,res,next)=>{
    usercollection=req.app.get('usercollection')
    next()

})

userApp.use((req, res, next) => {
    userrecipe = req.app.get('userrecipe');
    next();
});

//user registration route
userApp.post('/user', expressAsyncHandler(async (req,res)=>{
    //get user resource from the client
    const newUser=req.body;
    //check for duplicate user based on userName
    const dbuser=await usercollection.findOne({username:newUser.username})
    //if user found in db
    if(dbuser!=null){
        res.send({message:"User existed"})
    }
    else{
        //hash the password 
        const hashedpassword=await bcryptjs.hash(newUser.password,6)
        //replace plain pwd with hashed pwd
        newUser.password=hashedpassword;
        //create user
        await usercollection.insertOne(newUser)
        //send res
        res.send({message:"User created"})
    }
}))

//user login
userApp.post('/login',expressAsyncHandler( async (req,res)=>{
    //get cred obj from client
    const userCred=req.body;
    //check for username
    const dbuser=await usercollection.findOne({username:userCred.username})
    if(dbuser==null){
        res.send({message:"Invalid username"})
    }else{
    //check for pwd
    const status=await bcryptjs.compare(userCred.password,dbuser.password)
    if(status==false){
        res.send({message:"Invalid password"})
    }else{
    //create jwt token and encode it
    const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:20})
    //send response
    res.send({message:"login success",token:signedToken,user:dbuser})
    }
    }
}))

//get articles of all users
userApp.get('/articles',expressAsyncHandler(async (req,res)=>{
    //get articlescollection from express app
    const articlescollection=req.app.get('articlescollection')
    //get all articles
    let articlesList=await articlescollection.find({ status: true }).toArray()
    //send res
    res.send({message:"articles",payload:articlesList})

}))
let userrecipe;
userApp.post('/recipe', expressAsyncHandler(async (req, res) => {
    try {
        const newRecipe = req.body;

        // Insert the new recipe into the database
        await userrecipe.insertOne(newRecipe);

        res.send({ message: "Recipe submitted successfully" });
    } catch (error) {
        console.error('Error submitting recipe:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}));

// //post comments for an arcicle by atricle id
// userApp.post(
//     "/comment/:articleId",verifyToken,
//     expressAsyncHandler(async (req, res) => {
//       //get user comment obj
//       const userComment = req.body;
//       const articleIdFromUrl=(+req.params.articleId);
//       //insert userComment object to comments array of article by id
//       let result = await articlescollection.updateOne(
//         { articleId: articleIdFromUrl},
//         { $addToSet: { comments: userComment } }
//       );
//       console.log(result);
//       res.send({ message: "Comment posted" })
// }))
  
userApp.get('search/:q', async (req, res) => {
    const query = req.params.q; // Get the search query from the URL parameter

    try {
        // Search for recipes that match the query title
        const recipes = await userrecipe.find({ title:  q });

        res.json(recipes); // Return the matching recipes as JSON response
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to change password
userApp.post('/change-password', expressAsyncHandler(async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    // Find user by username
    const user = await usercollection.findOne({ username });

    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    // Check if the current password is correct
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        return res.status(400).send({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

    // Update user's password in the database
    await usercollection.updateOne({ username }, { $set: { password: hashedNewPassword } });

    res.send({ message: 'Password changed successfully' });
}));
// Route to change username
userApp.post('/change-username', expressAsyncHandler(async (req, res) => {
    const { currentUsername, newUsername } = req.body;

    // Check if the new username is already taken
    const existingUser = await usercollection.findOne({ username: newUsername });

    if (existingUser) {
        return res.status(400).send({ message: 'Username is already taken' });
    }

    // Update user's username in the database
    await usercollection.updateOne({ username: currentUsername }, { $set: { username: newUsername } });

    res.send({ message: 'Username changed successfully' });
}));



//export userApp
module.exports=userApp;