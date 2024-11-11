const { where } = require("sequelize");
const { Products, Shops } = require("../models");
const { Op } = require("sequelize");

const createProduct = async (req, res) => {
  const { name, stock, price, shopId } = req.body;
  try {
    const newProduct = await Products.create({
      name,
      stock,
      price,
      shopId,
    })

    res.status(201).json({
      status: "Success",
      message: "Success create new product",
      isSuccess: true,
      data: {
        newProduct,
      },
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
        message: error.message || "Database error",
        isSuccess: false,
        data: null,
      });
    } else {
      return res.status(500).json({
        status: "Failed",
        message: "An unexpected error occurred",
        isSuccess: false,
        data: null,
      });
    }
  }
};

const getAllProduct = async (req, res) => {
  try {
    // Extract query params for filtering
    const { productName, price, shopName, stock, limit = 10, page = 1 } = req.query; // 1. limit page default

    const productCondition = {};

    // Add filtering conditions based on query params
    if (productName) productCondition.name = { [Op.iLike]: `%${productName}%` };
    if (stock) productCondition.stock = stock;

    // 2. Variabel untuk pagination
    const shop = {};
    if (shopName) shop.name = { [Op.like]: `%${shopName}%` };
    const offset = (page - 1) * limit; // Menghitung offset (Menentukan dari data ke berapa kita memulai pengambilan data) berdasarkan halaman


    // 3. Mengambil produk berdasarkan kondisi dan pagination
    const products = await Products.findAndCountAll({
      include: [
        {
          model: Shops,
          as: "shop",
          attributes: ["id", "name"], 
          where: shop,

        },
      ],
      attributes: ["id", "name", "stock", "price"],
      where: productCondition,
      limit: limit,
      offset: offset,
    });

    // 4. menghitung total halaman
    const totalData = products.count;

    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: "Success",
      message: "Success get products data",
      isSuccess: true,
      data: {
        // 5 output
        totalData,
        totalPages, 
        currentPage: page,
        products: products.rows 
      },
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
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};


const getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Shops,
          as: "shop",
        },
      ],
    });

    res.status(200).json({
      status: "Success",
      message: "Success get product data",
      isSuccess: true,
      data: {
        product,
      },
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
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, stock, price } = req.body;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      res.status(404).json({
        status: "Failed",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Products.update({
      name,
      price,
      stock,
    });

    res.status(200).json({
      status: "Success",
      message: "Success update product",
      isSuccess: true,
      data: {
        product: {
          id,
          name,
          stock,
          price,
        },
      },
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
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Products.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      res.status(404).json({
        status: "Failed",
        message: "Data not found",
        isSuccess: false,
        data: null,
      });
    }

    await Products.destroy();

    res.status(200).json({
      status: "Success",
      message: "Success delete product",
      isSuccess: true,
      data: null,
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
    }

    res.status(500).json({
      status: "Failed",
      message: error.message,
      isSuccess: false,
      data: null,
    });
  }
};

module.exports = {
  createProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
