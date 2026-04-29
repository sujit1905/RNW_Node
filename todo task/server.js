const express = require('express')
const app = express()
const fs = require('fs')
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
// tasks
let tasks = []

// read from json file
if(fs.existsSync('tasks.json')){
    let data = fs.readFileSync('tasks.json', 'utf-8')
    tasks = JSON.parse(data)
    // console.log(tasks)
}
// saving function
function save(){
    fs.writeFileSync('tasks.json',JSON.stringify(tasks))
}
// main route
app.get('/',(req,res)=>{
    res.render("index.ejs",{tasks})
})

// add task route
app.post('/add',(req,res)=>{
    let newTask = {
        id:Date.now(),
        text:req.body.newTask,
        done:false
    }
    // verifying the task
    if(newTask.text.trim() !=''){
        tasks.push(newTask)
        save()
    } 
    res.redirect('/')
})

// done route for strikethrough functionality
app.get('/done/:id',(req,res)=>{
    let findTask = tasks.find(task=>task.id==req.params.id)
    if(findTask) {
        findTask.done = !findTask.done;
    }
    save()
    res.redirect('/')
})

// deleting the task
app.get('/delete/:id',(req,res)=>{
    tasks = tasks.filter(task=>task.id != req.params.id)
    console.log(tasks)
    save()
    res.redirect('/')
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})