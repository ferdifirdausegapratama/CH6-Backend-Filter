const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { where } = require("sequelize");
const { Auth, Users } = require("../models");
const { JsonWebTokenError } = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
    res.status(201).json({
      status: "Success",
      data: {},
    });
  } catch (err) {}
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const data = await Auths.findOne({
      include: [
        {
          model: Users,
          as: "user",
        },
      ],
      where: {
        email,
      },
    });

    if (!data) {
      return res.status(404).json({
        status: "Failed",
        message: "User does not exist",
        isSuccess: false,
        data: null,
      });
    }

    if (data && bcrypt.compareSync(password, data.user.password)) { 
      const token = jwt.sign(
        {
          id: data.id,
          username: data.user.name, 
          email: data.email,
          userId: data.user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRED,
        }
      );

      res.status(200).json({
        status: "Success",
        message: "Berhasil login",
        isSuccess: true,
        data: {
          username: data.user.name, 
        },
      });
    } else {
      res.status(401).json({
        status: "Failed",
        message: "Incorrect password",
        isSuccess: false, 
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({ 
      status: "Failed",
      message: "An error occurred",
      data: null,
    });
  }
};


        

const authenticate = async (req, res) => {
  try {
    res.status(200).json({
      status: "Success",
      data: {
        user: req.user,
      },
    });
  } catch (err) {}
};

module.exports = {
  register,
  login,
  authenticate,
};
