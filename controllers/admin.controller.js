const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");


const adminLogin = async (req,res)=>{
    try {
        const {email,password} = req.body;
        
        if(!email || !password)return res.status(404).json("Invalid Credentials");
    
        const user = await UserModel.findOne({email:email});
        if(!user){
            return res.status(404).json("User not found");
        }

        const comparedPassword = (user.password===password)?true:false
        const isAdmin = (user.role==="admin")?true:false;

        if(!isAdmin) return res.status(403).json("Access denied.");


        if(comparedPassword){
            const payLoad = {
                role:"admin",
                email:email
            }
            const token = await jwt.JwtSign(payLoad);
            if(token){
                res.setHeader("Auth",token)
            }
            res.status(200).json({status:"success",data:token})
        }else{
            return res.status(404).json("Invalid Password");
        }
    } catch (error) {
        console.log(error);
    }
}

const addUser = async (req,res)=>{
    try {
        const {email,password,role} = req.body;

        const userExists = await UserModel.findOne({email:email})
        if(userExists) return res.status(400).json("User Already Exists");
        const hashedPassword = await bcrypt.hash(password,10)

        const user = new UserModel({
            email:email,
            password: hashedPassword,
            role: role
        })
        const savedUser = await user.save();
        if(savedUser)return res.status(200).json({status:"success",data:savedUser})

    } catch (error) {
        console.log(error);
        
    }
}

const getUsers = async(req,res)=>{
    try {
        const users = await UserModel.find();
        return res.status(200).json({status:"success",data:users})
    } catch (error) {
        console.log(error);
        
    }
}






module.exports = {adminLogin,addUser,getUsers}