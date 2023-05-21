const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleWare 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('assignment server Running')
})


// mongo start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kri1sc7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toysCollection = client.db("animalToysdb").collection("allToys");

    //  get function 
    app.get('/allToys', async (req, res) => {
      const projection = { _id: 1, name: 1, sellerName: 1, category: 1, availableQuantity: 1, toysPicture: 1, price: 1 };
      const result = await toysCollection.find().project(projection).limit(20).toArray();
      res.send(result)
    })

    app.get('/toysPictures', async (req, res) => {
      const projection = { toysPicture: 1 };
      const result = await toysCollection.find().project(projection).limit(6).toArray();
      res.send(result)
    })

    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result)
    })

    // get my toys 
    app.get('/myToys', async (req, res) => {
      const sort = req.query?.sort ;
      query = { sellerEmail: req.query?.email }
      const projection = { name: 1, toysPicture: 1, category: 1, price: 1, availableQuantity: 1 };
       
      if(sort == 1 || sort == -1 ){
        const result = await toysCollection.find(query).sort({ price : parseInt(sort) }).collation({ locale : "en_US" , numericOrdering : true }).project(projection).toArray();
        res.send(result);
      }
      else {
        const result = await toysCollection.find(query).project(projection).toArray();
        res.send(result);
      }

    })


    app.get('/categoryData', async (req, res) => {
      const category = req.query?.category;
      const projection = { name: 1, toysPicture: 1, price: 1, rating: 1 };
      const result = await toysCollection.find({ category: category }).project(projection).toArray();
      res.send(result);

    })

    app.get('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query);
      res.send(result)
    })

    // post function 
    app.post('/addAToy', async (req, res) => {
      const addedToy = req.body;
      const result = await toysCollection.insertOne(addedToy)
      res.send(result)
    })

    //  patch function
    app.patch('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedData = req.body;
      const { price, availableQuantity, detailDescription } = updatedData;
      const updateDoc = {
        $set: {
          price: price,
          availableQuantity: availableQuantity,
          detailDescription: detailDescription
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // delete function 
    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongo end 
app.listen(port, () => {
  console.log(`animal server is Running on port : ${port}`);
})