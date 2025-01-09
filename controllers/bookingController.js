const KhuVuc = require("../models/khuVucModel");
const MonAn = require("../models/monAnModel");
const GioHang = require("../models/gioHangModel");
const KhachHang = require("../models/khachHangModel");
const ChiNhanh = require("../models/chiNhanhModel");
const PhieuDat = require("../models/phieuDatModel");
const { createId } = require("../utils/idCreator");
const NhanVien = require("../models/nhanVienModel");
const { DateTime } = require("mssql");
const PER_PAGE = 8;

class bookingController {
  async getTableBooking(req, res) {
    const { email, role } = req;
    const allKhuVuc = await KhuVuc.all();
    const user = await KhachHang.one(email);

    const chiNhanh = {};
    for (const cur of allKhuVuc) {
      const chiNhanhs = await KhuVuc.chiNhanhs(cur.MaKhuVuc);
      chiNhanh[cur.MaKhuVuc] = chiNhanhs.map((cn) => cn);
    }

    res.render("booking/tableBooking", {
      role,
      user,
      chiNhanh,
      allKhuVuc,
      title: "Đặt Bàn",
    });
  }

  async tableBooking(req, res) {
    const { email, role } = req;
    const { branch, people, note, customerId, date, time } = req.body;

    const customer = await KhachHang.oneById(customerId);
    if (!customer) {
      const { email, role } = req;
      const allKhuVuc = await KhuVuc.all();
      const user = await KhachHang.one(email);

      const chiNhanh = {};
      for (const cur of allKhuVuc) {
        const chiNhanhs = await KhuVuc.chiNhanhs(cur.MaKhuVuc);
        chiNhanh[cur.MaKhuVuc] = chiNhanhs.map((cn) => cn);
      }

      const toast = {
        message: "Khách hàng không tồn tại",
        type: "danger",
      };
      return res.render("booking/tableBooking", {
        role,
        user,
        chiNhanh,
        allKhuVuc,
        title: "Đặt Bàn",
        toast,
      });
    }

    const datetime = new Date(`${date} ${time}`);
    await ChiNhanh.tableBooking(branch, people, datetime, note, customerId);
    return res.redirect("/");
  }

  async getFoodBooking(req, res) {
    const { email, role } = req;
    const currentPage = parseInt(req.params.page) || 1;
    const allMonAn = await MonAn.all();
    allMonAn.forEach(async (cur) => {
      cur.MaKhuVuc = await KhuVuc.maKhuVuc(cur.MaMon);
    });
    const length = await MonAn.getTableLength();
    const allKhuVuc = await KhuVuc.all();
    const user = await KhachHang.one(email);
    const totalPages = Math.ceil(length / PER_PAGE);

    res.render("booking/foodBooking", {
      user,
      allMonAn,
      allKhuVuc,
      currentPage,
      totalPages,
      role,
      title: "Đặt Món",
    });
  }

  async cartAdding(req, res) {
    try {
      const { email, food } = req.body;
      GioHang.createGioHang(email, food);
      res.json({ success: true, message: "Đã thêm vào giỏ hàng" });
    } catch (error) {
      res.json({ success: false, message: "Đã có lỗi xảy ra" });
    }
  }

  async getCart(req, res) {
    const { email, role } = req;
    const { id } = req.params;
    const user = await KhachHang.one(email);
    let gioHang = await GioHang.getGioHangByMaKhachHang(id);
    gioHang = await Promise.all(
      gioHang.map(async (cur) => {
        const monAn = await MonAn.one(cur.MaMon);
        return { ...cur, ...monAn };
      })
    );
    const soLuong = gioHang.length;
    const tongTien = gioHang.reduce(
      (acc, cur) => acc + cur.Gia * cur.SoLuong,
      0
    );
    res.render("booking/cart", {
      gioHang,
      soLuong,
      tongTien,
      user,
      role,
      title: "Giỏ Hàng",
    });
  }

  async cartUpdate(req, res) {
    const { MAMON, MAKHACHHANG, SOLUONG } = req.body;
    await GioHang.updateGioHang(MAMON, MAKHACHHANG, SOLUONG);
    res.redirect("/booking/cart/" + MAKHACHHANG);
  }

  async cartRemove(req, res) {
    const { MAMON, MAKHACHHANG } = req.body;
    await GioHang.removeGioHang(MAMON, MAKHACHHANG);
    const previousUrl = req.get("Referer") || "/";
    res.redirect(previousUrl);
  }

  async cartCheckout(req, res) {
    const { MAKHACHHANG } = req.body;
    let gioHang = await GioHang.getGioHangByMaKhachHang(MAKHACHHANG);
    gioHang = await Promise.all(
      gioHang.map(async (cur) => {
        const monAn = await MonAn.one(cur.MaMon);
        return { ...cur, ...monAn };
      })
    );

    const { MaPhieu } = await NhanVien.addOrder(null, MAKHACHHANG);
    gioHang.forEach(async (cur) => {
      await NhanVien.addOrderDetail(MaPhieu, cur.MaMon, cur.SoLuong);
      await GioHang.removeGioHang(cur.MaMon, MAKHACHHANG);
    });

    res.redirect("/");
  }

  async getDishInfo(req, res) {
    const { email, role } = req;
    const { id } = req.params;
    const user = await KhachHang.one(email);
    const monAn = await MonAn.one(id);
    monAn.TenPhanMuc = await MonAn.getPhanMuc(id);
    res.render("booking/dishInfo", {
      monAn,
      user,
      role,
      title: "Thông Tin Món",
    });
  }
}

module.exports = new bookingController();
