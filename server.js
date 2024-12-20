import express from 'express';
import bodyParser from 'body-parser';
import * as fs from 'node:fs';
import cors from 'cors';
import axios from 'axios';
import DataScraper from './components/scrape.js';
import PromptNew from './components/model.js';
import https from 'follow-redirects/https.js';
import dotenv from 'dotenv';
import { METHODS } from 'node:http';
dotenv.config({
  'path':'.env'
});



async function makeRequest(query) {
  let key=process.env.API_KEY || 'a01a6141885abad8fed9e6c6b0d1528b647fec72';
  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://google.serper.dev/news?q=${query}&gl=in&apiKey=${key}`,
      headers: { }
    };
    try {
      const response = await axios.request(config);
      const output = JSON.stringify(response.data.news);
      // console.log(output);
      return output;
    }
    catch (error) {
      console.log(error);
    }
  }
  

const app=express();

// Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsoptions = {
  origin:'*',
  methods:['GET','POST'],
  allowedHeaders:['Content-Type', 'Authorization']
}
app.use(cors(corsoptions));

app.get('/', (req,res)=>{
    return res.send("hello from express server")
})
app.get('/about', (req,res)=>{
    return res.send("we are validate_ai from express server")
})
app.get('/hey', (req,res)=>{
    return res.end("hey " +req.query.name +"   from express server")
})
// app.get("/api/users",(req,res)=>{
//     return res.json(users);
// })
// app.get("/api/users/:id",(req,res)=>{
//     const id= Number(req.params.id);
//     const user=users.find((user)=> user.id===id);
//     return res.json(user);
    
// })


app.get("/api/web", async (req, res) => {
    try {
        
      const query = req.query.query;
      const transformedText = query.split(" ").join("+");
      const axiosResult= await makeRequest(transformedText);
      // APIManager(axiosResult);
      // if (!axiosResult || !Array.isArray(axiosResult)) {
      //   return res.status(500).json({ error: "Invalid response from makeRequest" });
      // }
      var results= null;
      if (axiosResult.length>2){

        let arrayincoming = JSON.parse(axiosResult);
        results = await Promise.all(arrayincoming.slice(0,3).map(async (datatx) => await DataScraper(datatx)));
        return res.status(200).json(results);
      }
      else{
        results = await PromptNew('Give me a summary in 30 words and dont add any remarks of yours or anything:'+query);
        return res.status(200).json(results);
      }
  

    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

app.listen(10000,()=>console.log("server started!!!!!"))
