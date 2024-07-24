const express = require ("express")
const mongoose = require ("mongoose")
const cors = require ("cors")
const bcrypt = require ("bcrypt")
const {registermodel} = require ("./models/register")
const jwt = require ("jsonwebtoken")
const {postModel} = require("./models/posts")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://rizna10:rizna2003@cluster0.u7ke2.mongodb.net/blogsdb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async (password) =>{
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
    }
    app.post("/signup",async(req,res)=>{
        let input = req.body
        let hashedPassword = await generateHashedPassword(input.pass)
        console.log(hashedPassword)
        input.pass = hashedPassword
        let blog = new registermodel(input)
        blog.save()
    
        res.json({"status":"success"})
    })

app.post("/login",(req,res)=>{
    let input = req.body
    registermodel.find({"emailid":req.body.emailid}).then(
        (response)=>{
            if (response.length>0) {

                let dbpassword = response[0].pass
                console.log(dbpassword)
                bcrypt.compare(input.pass,dbpassword,(error, isMatch)=>{

                    if (isMatch) {

                       jwt.sign({email:input.emailid},"blog-app",{expiresIn:"1d"},
                        (error,token)=>{
                                if (error) {
                                    res.json({"status":"Unable to create token"})
                                    
                                } else {

                                    res.json({"status":"success","userId":response[0]._id,"token":token})
                                    
                                }
                        }
                       )
                        
                    } else {
                        res.json({"status":"incorrect"})
                        
                    }

                })
                
            } else {
                res.json({"status":"User not found"})
            }
        }
    ).catch().finally()
})

app.post("/add",async(req,res)=>{
    let input = req.body
    let token = req.headers.token
    jwt.verify(token,"blog-app",async(error,decoded)=>{
        if (decoded && decoded.email) {
            let result = new postModel(input)
            await result.save()
            res.json({"status":"success"})
            
        } else {
            res.json({"status":"Invalid Authentication"})
            
        }
    })
})

app.post("/viewall",(req,res)=>{
    let token = req.headers.token
    jwt.verify(token,"blog-app",(error,decoded)=>{
        if (decoded && decoded.email) {
            postModel.find().then(
                (items)=>{
                    res.json(items)
                }
            ).catch(
                (error)=>{
                    res.json({"status":"error"})
                }
            )
            
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
})

app.listen(8080,()=>{
    console.log("Server Started")
})
