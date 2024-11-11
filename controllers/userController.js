const { Users } = require("../models");
const { Op } = require("sequelize");

const findUsers = async (req, res, next) => {
  try {
    const { name, age, role, address, shopId, page = 1, limit = 10 } = req.query;

    const userCondition = {};

    if (name) userCondition.name = { [Op.iLike]: `%${name}%` };
    if (age) userCondition.age = age;
    if (role) userCondition.role = role;
    if (address) userCondition.address = { [Op.iLike]: `%${address}%` };
    if (shopId) userCondition.shopId = shopId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await Users.findAndCountAll({
      where: userCondition,
      limit: parseInt(limit),
      offset: offset,
    });

    const totalData = users.count;
    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: "Success",
      message: "Berhasil mendapatkan data pengguna",
      isSuccess: true,
      data: {
        totalData,
        totalPages,
        currentPage: parseInt(page),
        users: users.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan pada server",
      isSuccess: false,
      data: null,
    });
  }
};

const findUserById = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "Pengguna tidak ditemukan",
        isSuccess: false,
      });
    }

    res.status(200).json({
      status: "Success",
      data: {
        user,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan pada server",
      isSuccess: false,
      data: null,
    });
  }
};

const updateUser = async (req, res, next) => {
  const { name, age, role, address, shopId } = req.body;
  try {
    const [updated] = await Users.update(
      { name, age, role, address, shopId },
      {
        where: { id: req.params.id },
      }
    );

    if (!updated) {
      return res.status(404).json({
        status: "Failed",
        message: "Pengguna tidak ditemukan",
        isSuccess: false,
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Sukses update user",
      isSuccess: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan pada server",
      isSuccess: false,
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "Pengguna tidak ditemukan",
        isSuccess: false,
      });
    }

    await Users.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Sukses delete user",
      isSuccess: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Terjadi kesalahan pada server",
      isSuccess: false,
    });
  }
};

module.exports = {
  findUsers,
  findUserById,
  updateUser,
  deleteUser,
};
