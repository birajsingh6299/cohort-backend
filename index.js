import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config();

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], //case insensitive
  allowedHeaders: ['Content-Type', 'Authorizations'] //case sensitive
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}))


const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Cohort!')
})

app.get('/biraj', (req, res) => (
    res.send('Biraj!')
))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})