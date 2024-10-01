import express from 'express'
import bodyParser from 'body-parser'
const app = express()
const port = 3000
import { getProjects } from './db.js'


app.set('view engine','ejs')
app.use(express.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    const ps= await getProjects()
    res.render('main',{projs:ps})
})
app.use(express.static(import.meta.dirname+'/styles'))
app.use(express.static(import.meta.dirname+'/images'))
import {router as projRouter} from './routes/project.js'

app.use('/project',projRouter)



app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})