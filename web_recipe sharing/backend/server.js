const exp = require('express');
const app = exp();
require('dotenv').config();
const mc = require('mongodb').MongoClient;

app.use(exp.json());

mc.connect(process.env.DB_URL)
  .then(client => {
    const cuisine = client.db('cuisine');
    const indiancollection = cuisine.collection('indiancollection');
    const chinesecollection = cuisine.collection('chinesecollection');
    const frenchcollection = cuisine.collection('frenchcollection');
    const americancollection = cuisine.collection('americancollection');
    const italiancollection = cuisine.collection('italiancollection');
    const japanesecollection = cuisine.collection('japanesecollection');
    const mexicancollection = cuisine.collection('mexicancollection');
    const spanishcollection = cuisine.collection('spanishcollection');
    const usercollection = cuisine.collection('usercollection'); 
    const userrecipe = cuisine.collection('userrecipe');

    // Share collection objects with the Express app
    app.set('indiancollection', indiancollection);
    app.set('chinesecollection', chinesecollection);
    app.set('frenchcollection', frenchcollection);
    app.set('americancollection', americancollection);
    app.set('italiancollection', italiancollection);
    app.set('japanesecollection', japanesecollection);
    app.set('mexicancollection', mexicancollection);
    app.set('spanishcollection', spanishcollection);
    app.set('usercollection', usercollection);
    app.set('userrecipe', userrecipe); 

    // Confirm DB collection status
    console.log("DB connection success");

  })
  .catch(err => console.log("Error in DB collection", err));
  const userApp=require('./APIs/user-api')
  app.use('/user-api',userApp)

  app.use((err,req,res,next)=>{
    res.send({message:"error",payload:err.message})
})


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Web server on port ${port}`));
