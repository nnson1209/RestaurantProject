const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const KhachHang = require("../models/khachHangModel");
const { createToken } = require("../utils/tokenCreator");

class authControllers {
  // [GET] /auth/login
  async getUserLogin(req, res) {
    res.render("auth/login", { title: "Login" });
  }

  // [POST] /auth/login
  async postUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.one(email);
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại" });
    }

    const checkPassword = await bcrypt.compare(password, user.MatKhau);
    if (!checkPassword) {
      return res.json({ success: false, message: "Mật khẩu không đúng" });
    }

    const token = createToken({
      email: user.Email,
      role: user.VaiTro,
    });
    res.cookie("accessToken", token, { httpOnly: true });

    let redirect;
    if (user.VaiTro === "staff") {
      redirect = "/staff";
    } else {
      redirect = "/";
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      redirect,
      token,
    });
  }

  // [GET] /auth/logout
  async logout(req, res) {
    res.clearCookie("accessToken");
    res.redirect("/");
  }

  // [GET] /auth/register
  async register(req, res) {
    res.render("auth/register", { title: "Register" });
  }

  // [POST] /auth/register
  async postRegister(req, res) {
    const { email, password, name, cccd, phone, gender } = req.body;
    const checkUser = await User.one(email);
    if (checkUser) {
      return res.json({ success: false, message: "Email đã tồn tại" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const maKhachHang = await KhachHang.add({
      email,
      name,
      cccd,
      phone,
      gender,
    });
    await User.add({
      email,
      password: hashPassword,
      maKhachHang,
    });
    res.json({ success: true, message: "Đăng ký thành công" });
  }
}

module.exports = new authControllers();
