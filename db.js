import mysql from 'mysql2'


const pool=mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password: '',
    database:'JoeProjTest'
}).promise()


export async function getConsults(proj) {
    const [rows] = await pool.query('Select * from consultants where Proj_Name =?',[proj])
    return rows
}

export async function getInvoices(proj) {
    const [rows] = await pool.query('Select * from invoice where Proj_Name =?',[proj])

    return rows
}

export async function getProjects() {
    const [rows] = await pool.query('Select * from project')
    return rows
}
export async function getTimesheets(proj) {
    const [rows] = await pool.query('Select SheetID,ConsultantFN,ConsultantLN,timesheets.Start_Date,timesheets.End_Date,Hours from timesheets join consultants on timesheets.ConsultantID = consultants.ConsultantID where consultants.Proj_Name = ?',[proj])
    return rows
}

export async function selectProject(proj) {
    const [row] = await pool.query('Select * from project where Proj_Name = ?',[proj])
    return row[0]
}
export async function deleteRow(id,proj) {
    if(id.startsWith('Inv')){
        let num = parseInt(id.replace('Inv',''));
        await pool.query('DELETE FROM invoice where Proj_Name = ? and InvoiceNum = ?',[proj,num])
    }else if(id.startsWith('Con')){
        let con = id.replace('Con','')
        
        await pool.query('DELETE FROM consultants where Placement = ?',[con])
    }
    
}
export async function updateProject(body) {
    try { 
        let formRows =[]
        // Fetch the existing record
        for(let i = 0 ;i<body.Consultant.length;i++){
            let n= body.Consultant[i].split(" ")
            let row={
                Proj_Name:body.Proj_Name,
                NTE_AMT: parseInt(body.NTE_AMT),
                Term: Date.parse(body.Term),
                PrcsNum:  parseInt(body.PrcsNum),
                ConsultantID:n[0]+n[1]+body.Placement[i].slice(body.Placement[i].length-4,body.Placement[i].length),
                ConsultantFN: n[0],
                ConsultantLN : n[1],
                Placement: body.Placement[i],
                StartDate: Date.parse(body.StartDate[i]),
                EndDate: Date.parse(body.EndDate[i]),
                Recruiter: body.Recruiter[i],
                Bill_Rate:body.Bill_Rate[i],
                Pay_Rate:body.Pay_Rate[i],
            }
            formRows.push(row)
        }
        
        let invoices=[]
        if(body.InvoiceNum ){
            if(typeof body.InvoiceNum == 'object' ){
                for(let i = 0 ;i<body.InvoiceNum.length;i++){
                    let invoice={
                        InvoiceNum:body.InvoiceNum[i],
                        Proj_Name:body.Proj_Name,
                        Anticipated_Date: Date.parse(body.Anticipated_Date[i]),
                        Billables: parseInt(body.Billables[i]),
                        Expenses:  parseInt(body.Expenses[i]),
                        Surplus:parseInt(body.Surplus[i]),
                        Sent_Accounting: Date.parse(body.Anticipated_Date[i]),
                        Sent_Coupa : Date.parse(body.Anticipated_Date[i]),
                        Coupa_Num: parseInt(body.Coupa_Num[i]),
                    }
                    invoices.push(invoice)
                }
            }else{
                let invoice={
                    InvoiceNum:body.InvoiceNum,
                    Proj_Name:body.Proj_Name,
                    Anticipated_Date: Date.parse(body.Anticipated_Date),
                    Billables: parseInt(body.Billables),
                    Expenses:  parseInt(body.Expenses),
                    Surplus:parseInt(body.Surplus),
                    Sent_Accounting: Date.parse(body.Anticipated_Date),
                    Sent_Coupa : Date.parse(body.Anticipated_Date),
                    Coupa_Num: parseInt(body.Coupa_Num),
                }
                invoices.push(invoice)
            }
        }
        let timesheets=[]
        if(body.consTS){
            for(let i = 0 ;i<body.consTS.length;i++){
                let n= body.consTS[i].split(" ")
                let s =body.startTS[i].split('/')
                let e = body.endTS[i].split('/')
                let id= s[0]+s[1]+e[0]+e[1]

                let time={ 
                    SheetID:parseInt(id),
                    StartDate: Date.parse(body.startTS[i]),
                    EndDate: Date.parse(body.endTS[i]),
                    ConsultantID:n[0]+n[1]+body.Placement[body.Consultant.indexOf(body.consTS[i])].slice(body.Placement[body.Consultant.indexOf(body.consTS[i])].length-4,body.Placement[body.Consultant.indexOf(body.consTS[i])].length),
                    hours:parseInt(body.hoursTS[i]),
                    Proj_Name:body.Proj_Name,
                }
                timesheets.push(time)
            }
        }

        //Construct the SQL update query
        formRows.forEach(async (r)=>{
            const updateProj = `INSERT INTO project(Proj_Name,NTE_AMT,Term,PrcsNum) VALUES (?,?,?,?)
                                        ON DUPLICATE KEY UPDATE  
                                        Proj_Name = ?,
                                        NTE_AMT = ?,
                                        Term = ?,
                                        PrcsNum = ?`;
            let projFields= [r['Proj_Name'],r['NTE_AMT'],r['Term'],r['PrcsNum'],r['Proj_Name'],r['NTE_AMT'],r['Term'],r['PrcsNum']]
            const [projResult] = await pool.query(updateProj, projFields);
            const updateCons = `INSERT INTO consultants (ConsultantID,ConsultantFN,ConsultantLN,Proj_Name,Placement,Start_Date,End_Date,Recruiter,Bill_Rate,Pay_Rate) VALUES (?,?,?,?,?,?,?,?,?,?)
                                        ON DUPLICATE KEY UPDATE  
                                        ConsultantID=?,
                                        ConsultantFN=?,
                                        ConsultantLN=?,
                                        Proj_Name=?,
                                        Placement=?,
                                        Start_Date=?,
                                        End_Date=?,
                                        Recruiter=?,
                                        Bill_Rate=?,
                                        Pay_Rate=?`;
            let confields = [r['ConsultantID'],r['ConsultantFN'],r['ConsultantLN'],r['Proj_Name'],r['Placement'], r['StartDate'],r['EndDate'],r['Recruiter'],r['Bill_Rate'],r['Pay_Rate'],r['ConsultantID'],r['ConsultantFN'],r['ConsultantLN'],r['Proj_Name'],r['Placement'], r['StartDate'],r['EndDate'],r['Recruiter'],r['Bill_Rate'],r['Pay_Rate']]
            const [consResult] = await pool.query(updateCons, confields);


        })
        invoices.forEach(async (r)=>{
            const updateInvs = `INSERT INTO invoice (InvoiceNum,Proj_Name,Anticipated,Billables,Expenses,Surplus,Sent_Accounting,Sent_Coupa,Coupa_Num) VALUES (?,?,?,?,?,?,?,?,?)       
                                            ON DUPLICATE KEY UPDATE  
                                           InvoiceNum=?,
                                            Proj_Name=?,
                                           Anticipated=?,
                                            Billables=?,
                                            Expenses=?,
                                            Surplus=?,
                                           Sent_Accounting=?,
                                            Sent_Coupa=?,
                                           Coupa_Num=?`;
            let invfields = [r['InvoiceNum'],r['Proj_Name'],r['Anticipated_Date'],r['Billables'], r['Expenses'],r['Surplus'],r['Sent_Accounting'],r['Sent_Coupa'],r['Coupa_Num'],r['InvoiceNum'],r['Proj_Name'],r['Anticipated_Date'],r['Billables'], r['Expenses'],r['Surplus'],r['Sent_Accounting'],r['Sent_Coupa'],r['Coupa_Num']]
            const [invResult] = await pool.query(updateInvs, invfields);
        })
        timesheets.forEach(async (r)=>{
            const updateTims = `INSERT INTO timesheets (SheetID,ConsultantID,Start_Date,End_Date,Hours,Proj_Name) VALUES (?,?,?,?,?,?)       
                                            ON DUPLICATE KEY UPDATE  
                                            SheetID=?,
                                            ConsultantID=?,
                                            Start_Date=?,
                                            End_Date=?,
                                            Hours=?,
                                            Proj_Name=?`;
            let timfields = [r['SheetID'],r['ConsultantID'],r['StartDate'],r['EndDate'], r['hours'],r['Proj_Name'],r['SheetID'],r['ConsultantID'],r['StartDate'],r['EndDate'], r['hours'],r['Proj_Name']]
            const [timResult] = await pool.query(updateTims, timfields);
        })
        //res.json({ message: 'Record updated successfully' });
      } catch (err) {
        console.error(err);
        
      }
}
