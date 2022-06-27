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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}



async function run(){
    try{
       await client.connect();
       const productCollection = client.db('handyWorks').collection('products');
       const modelCollection = client.db('handyWorks').collection('model');
       const userCollection = client.db('handyWorks').collection('user');
       const reviewCollection = client.db('handyWorks').collection('review');
       
      
       
      //  show products 
       app.get('/product', async(req, res ) =>{
        const query = {};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
       });

       app.put('/user/:email', async(req, res) =>{
         const email = req.params.email;
         console.log(email);
         const user = req.body;
         const filter = {email: email};
         const options = {upsert: true};
         const updateDoc = {
              $set:user,
         };
         const result = await userCollection.updateOne(filter, updateDoc, options);
         const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '455d'})
         res.send({result, accessToken: token}); 
       })

       app.get('/product/:id', async(req, res) =>{
         const id = req.params.id;
         const query = {_id: ObjectId(id)};
         const product = await productCollection.findOne(query);
         res.send(product);
       });



       app.get('/model/:email', verifyJWT, async (req, res) =>{
         const person = req.params.email;
         console.log(person);
        
         const decodedEmail = req.decoded.email;
         console.log(decodedEmail);
         
         if(person === decodedEmail){
          const query = {person: person};
          const model = await modelCollection.find(query).toArray();
         return res.send(model);
         }
         else{
           return res.status(403).send({message: 'forbidden access'});
         }
       })

     
       app.post('/model', async(req, res) => {
         const model = req.body;
        //  const query = {model: model.model, person: model.person}
         
        //  const exists = await modelCollection.findOne(query);
        //  if(exists){
        //    return res.send({success: false, model:exists})
        //  }
         const result = await modelCollection.insertOne  (model);
         return res.send(result);
         

       })

       app.post("/review", async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result);
      });

      // admin
      app.get("/admin/:email", async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === "admin";
        res.send({ admin: isAdmin });
      });
 
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