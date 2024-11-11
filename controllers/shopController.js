const { Shops, Products, Users } = require("../models");
const { Op, where } = require("sequelize");

const createShop = async (req, res) => {
  const { name, adminEmail, userId } = req.body;

  try {
    const newShop = await Shops.create({
      name,
      adminEmail,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "Success",
      message: "Successfully created new Shop",
      isSuccess: true,
      data: { newShop },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Failed",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        status: "Failed",
        message: error.message || "Database Error",
        isSuccess: false,
        data: null,
      });
    } else {
      res.status(500).json({
        status: "Failed",
        message: "An unexpected error occurred",
        isSuccess: false,
        data: null,
      });
    }
  }
};

const getAllShop = async (req, res) => {
  try {
    const { shopName, adminEmail, productName, stock, size, page, userName } = req.query;

    const condition = {};
    if (shopName) condition.name = { [Op.iLike]: `%${shopName}%` };
    if (adminEmail) condition.adminEmail = { [Op.iLike]: `%${adminEmail}%` };

    const productCondition = {};
    if (productName) productCondition.name = { [Op.iLike]: `%${productName}%` };
    if (stock) productCondition.stock = stock;

    const userCondition = {};
    if (userName) userCondition.name = { [Op.iLike]: `%${userName}%` };

    const pageSize = parseInt(size, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;
    const offset = (pageNum - 1) * pageSize;

    const totalCount = await Shops.count({
      include: [
        {
          model: Products,
          as: "products",
          where: productCondition,
        },
        {
          model: Users,
          as: "user",
          where: userCondition,
        },
      ],
      where: condition,
    });

    const shops = await Shops.findAll({
      include: [
        {
          model: Products,
          as: "products",
          attributes: ["name", "images", "stock", "price"],
          where: productCondition,
        },
        {
          model: Users,
          as: "user",
          attributes: ["name"],
          where: userCondition,
        },
      ],
      attributes: ["name", "adminEmail"],
      where: condition,
      limit: pageSize,
      offset,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      status: "Success",
      message: "Successfully retrieved shop data",
      isSuccess: true,
      data: {
        totalData: totalCount,
        shops,
        pagination: {
          page: pageNum,
          size: pageSize,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};


const getShopById = async (req, res) => {
  const id = req.params.id;

  try {
    const shop = await Shops.findOne({
      where: { id },
      include: [
        {
          model: Products,
          as: "products",
          attributes: ["name", "images", "stock", "price"],
        },
        {
          model: Users,
          as: "user",
          attributes: ["name"],
        },
      ],
    });

    if (!shop) {
      return res.status(404).json({
        status: "Fail",
        message: "Shop not found",
        isSuccess: false,
        data: null,
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Successfully retrieved shop data",
      isSuccess: true,
      data: { shop },
    });
  } catch (error) {
    console.log(error.name);
    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const updateShop = async (req, res) => {
  const id = req.params.id;
  const { name, adminEmail } = req.body;

  try {
    const shop = await Shops.findOne({ where: { id } });

    if (!shop) {
      return res.status(404).json({
        status: "Fail",
        message: "Shop not found",
        isSuccess: false,
        data: null,
      });
    }

    await shop.update({ name, adminEmail });

    res.status(200).json({
      status: "Success",
      message: "Successfully updated shop",
      isSuccess: true,
      data: { shop },
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const deleteShop = async (req, res) => {
  const id = req.params.id;

  try {
    const shop = await Shops.findOne({ where: { id } });

    if (!shop) {
      return res.status(404).json({
        status: "Fail",
        message: "Shop not found",
        isSuccess: false,
        data: null,
      });
    }

    await Shops.destroy({ where: { id } });

    res.status(200).json({
      status: "Success",
      message: "Successfully deleted shop",
      isSuccess: true,
      data: null,
    });
  } catch (error) {
    console.log(error.name);
    if (error.name === "SequelizeValidationError") {
      const errorMessage = error.errors.map((err) => err.message);
      return res.status(400).json({
        status: "Fail",
        message: errorMessage[0],
        isSuccess: false,
        data: null,
      });
    }

    res.status(500).json({
      status: "Fail",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

module.exports = {
  createShop,
  getAllShop,
  getShopById,
  updateShop,
  deleteShop,
};
