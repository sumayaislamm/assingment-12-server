const express = require('express');
const cors = require('cors');
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
       
      
       
      //  show products 
       app.get('/product', async(req, res ) =>{
        const query = {};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
       });

       app.get('/product/:id', async(req, res) =>{
         const id = req.params.id;
         const query = {_id: ObjectId(id)};
         const product = await productCollection.findOne(query);
         res.send(product);
       });

     
       app.post('/model', async(req, res) => {
         const model = req.body;
         const query = {model: model.model, person: model.person} 
         const exists = await modelCollection.findOne(query);
    
         if(exists){
           return res.send({success: false, model:exists})
         }

         const result = await modelCollection.insertOne  (model);
         return res.send({success: true, result});
       })
      
      


        

      // //  add post 

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