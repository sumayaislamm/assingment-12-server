const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6w3c6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
       await client.connect();
       const productCollection = client.db('handyWorks').collection('products');
       const modelCollection = client.db('handyWorks').collection('model');
       const userCollection = client.db('handyWorks').collection('user');
       
      
       
      //  show products 
       app.get('/product', async(req, res ) =>{
        const query = {};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
       });

       app.put('/user/:email', async(req, res) =>{
         const email = req.params.email;
         const user = req.body;
         const filter = {email: email};
         const options = {upsert: true};
         const updateDoc = {
              $set:user,
         };
         const result = await userCollection.updateOne(filter, updateDoc, options);
         const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRATE, { expiresIn: '1h'} )
         res.send({result, token}); 
       })

       app.get('/product/:id', async(req, res) =>{
         const id = req.params.id;
         const query = {_id: ObjectId(id)};
         const product = await productCollection.findOne(query);
         res.send(product);
       });

       app.get('/model', async(req, res) =>{
         const email = req.query.email;
         const query = {email: email};
         console.log(query);
         const model = await modelCollection.find(query).toArray();
         res.send(model);
       })

     
       app.post('/model', async(req, res) => {
         const model = req.body;
         const query = {model: model.model, person: model.person} 
         const exists = await modelCollection.findOne(query);
    
        //  if(exists){
        //    return res.send({success: false, model:exists})
        //  }

         const result = await modelCollection.insertOne  (model);
         return res.send({success: true, result});
       })
      
      

      //  app.get('/available', async(req, res)=>{

      //   const available = req.query.available || "67";

      //   const products = await productCollection.find().toArray();

      //   const query = {available: available};
      //   const model = await modelCollection.find(query).toArray();

      //   products.forEach(product =>{
      //     const productModel = model.filter(m => m.model === product.name);
      //     const modeled = productModel.map(a => a.available);
      //     product.modeled = modeled
      //   })

      //   res.send(products);

      //  })
      


        

      //  add post 

      //  app.post('/product', async(req, res) =>{
      //    const newReview = req.body;
      //    const result = await reviewCollection.insertOne(newReview);
      //    res.send(result);
      //  });
    }
    finally{

    } 
}

run().catch(console.dir);


app.get('/', (req , res)=>{
  res.send('Running Server');
})


app.listen(port, ()=>{
  console.log('Listening to Handy works', port);
})