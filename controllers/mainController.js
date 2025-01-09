const MonAn = require("../models/monAnModel");
const KhachHang = require("../models/khachHangModel");
const NhanVien = require("../models/nhanVienModel");

class mainController {
  async loadMainPage(req, res) {
    const { email, role } = req;
    if (role === "staff") {
      res.redirect("/staff");
      return;
    }

    const user = await KhachHang.one(email);
    const allMonAn = await MonAn.all();
    res.render("index", { user, role, allMonAn, title: "Trang Chủ" });
  }

  async search(req, res) {
    const { email, role } = req;
    const { query } = req.body;

    const searchResult = await MonAn.search(query);
    const user = await KhachHang.one(email);

    res.render("search/search", {
      query,
      searchResult,
      user,
      title: "Kết quả tìm kiếm",
      role,
    });
  }

  async searchResult(req, res) {
    const { query } = req.query;
    const searchResult = await MonAn.search(query);

    res.json(searchResult);
  }

  async loadProfile(req, res) {
    const { email, role } = req; // Lấy thông tin từ middleware
    const { id } = req.params; // Lấy ID từ route parameters
  
    try {
      // Lấy thông tin người dùng hiện tại
      const user = role === "customer" 
        ? await KhachHang.one(email) 
        : await NhanVien.getMaNhanVienByEmail(email);
  
      if (!user) {
        return res.status(404).send("User not found.");
      }
  
      // Lấy thông tin hồ sơ cần hiển thị
      const profile = role === "customer" 
        ? await KhachHang.oneById(id) 
        : await NhanVien.oneById(id);
  
      if (!profile) {
        return res.status(404).send("Profile not found.");
      }
  
      // Render đúng file EJS dựa trên vai trò
      const template = role === "customer" 
        ? "customerProfile" 
        : "staffProfile";

      res.render(template, {
        user,
        role,
        profile,
        title: role === "customer" ? "Thông tin khách hàng" : "Thông tin nhân viên",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      res.status(500).send("Internal Server Error.");
    }
  }
}

module.exports = new mainController();
