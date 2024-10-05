import express from 'express'
const router = express.Router()
import {getConsults,getInvoices,getTimesheets,selectProject, updateProject} from '../db.js'
router.use(express.static(import.meta.dirname+'/images'))

router
    .get("/:proj", async (req, res) => {
        const consultants = await getConsults(req.params.proj)
        const invoices = await getInvoices(req.params.proj)
        const project = await selectProject(req.params.proj)
        const timesheets = await getTimesheets(req.params.proj)
        res.render('project' , {
            name : project.Proj_Name,
            NTE : project.NTE_AMT,
            term:project.Term,
            purchase:project.PrcsNum,
            consults:consultants,
            invs:invoices,
            times:timesheets  
        })
    })
    .post("/:proj",async(req, res) => { 
        const project = await selectProject(req.params.proj)
        await updateProject(req.body,project)
        res.redirect('/')
    })
    .delete((req, res) => {
        res.render('project' , {info : "Test"})
    })

    router
    .route("/")
    .get( async (req, res) => {
        res.render('project')
    })
    .put((req, res) => {
        res.render('project' , {info : "Test"})
    })
    .delete((req, res) => {
        res.render('project' , {info : "Test"})
    })

export {router} 