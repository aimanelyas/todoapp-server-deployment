import express from 'express'
import {v4 as uuidv4} from 'uuid'
import cors from 'cors'
// const pool = require('./db')
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dbInit from "./database/index.js"
import User from "./model/user.js"
import Todo from "./model/todo.js"

const app = express()
const PORT = process.env.PORT ?? 8000

dbInit();  


app.use(cors())
app.use(express.json())

// get all todos
app.get('/todos/:userEmail', async(req, res) => {
    console.log(req)
    const {userEmail} =  req.params
    try {
        const todos = await Todo.findAll({
            where: {
                user_email: userEmail,
            }
        })
        res.json(todos)
    } catch (err) {
        console.error(err)
    }
})

//create a new todo
app.post('/todos', async(req, res) => {
    const {user_email, title, progress, date} = req.body
    console.log(user_email, title, progress, date)
    const id = uuidv4()
    try {
        const newTodo = await Todo.create({
            id: id,
            user_email: user_email,
            title: title,
            progress: progress,
            date: date,
        })
        res.json(newTodo)
    } catch (err) {
        console.log(err)
    }
})

//edit a todo
app.put('/todos/:id', async( req, res) => {
    const {id} = req.params
    const {user_email, title, progress, date} = req.body
    try {
        const editTodo = await Todo.update({
            user_email,
            title,
            progress,
            date,
        },
        {where: {
            id: id,
        }})
        res.json(editTodo)
    } catch (err) {
        console.error(err)
    }
})

//delete a todo
app.delete('/todos/:id', async (req, res) => {
    const {id} = req.params
    try {
        const deleteTodo = await Todo.destroy({where: {id: id}})
        
        res.json(deleteTodo)
    } catch (err) {
        console.error(err)
    }
})


// signup
app.post('/signup', async (req, res) => {
    const { email, password} = req.body
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    try {
        const newUser = await User.create({
            email: email,
            hashed_password: hashedPassword,
        })

        const token = jwt.sign({email}, 'secret', {expiresIn: '1hr'})

        res.json({email, token})

    } catch (err) {
        console.error(err)
        if (err) {
            res.json({detail : err.detail})
        }
    }
})

// login
app.post('/login', async (req, res) => {
    const { email, password} = req.body
    try {
        const users = await User.findOne({
            where: {
                email: email,
            }
        })

        if (!users) return res.json({detail: 'User does not exist!'})

        const success = await bcrypt.compare(password, users.hashed_password)
        const token = jwt.sign({email}, 'secret', {expiresIn: '1hr'})

        if (success) {
            res.json({'email': users.email, token})
        } else {
            res.json({detail: "Login failed"})
        }
    } catch (err) {
        console.error(err)
    }
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))