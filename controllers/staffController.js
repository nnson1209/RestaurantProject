const KhachHang = require("../models/khachHangModel");
const KhuVuc = require("../models/khuVucModel");
const MonAn = require("../models/monAnModel");
const NhanVien = require("../models/nhanVienModel");
const PhanMuc = require("../models/phanMucModel");
const PhieuDat = require("../models/phieuDatModel");
const ChiNhanh = require("../models/chiNhanhModel");
const PER_PAGE = 8;

class staffController {
  // [GET] /staff ok
  async loadMainPage(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);
    res.render("staff/staffDashboard", { title: "Dashboard", user, role });
  }

  // [GET] /staff/add-dish ok
  async addDish(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const allKhuVuc = await KhuVuc.all();
    const phanMuc = {};
    for (const cur of allKhuVuc) {
      const phanMucs = await KhuVuc.phanMucs(cur.MaKhuVuc);
      phanMuc[cur.MaKhuVuc] = phanMucs;
    }

    res.render("staff/addDish", {
      title: "Add Dish",
      user,
      role,
      allKhuVuc,
      phanMuc,
    });
  }

  // [POST] /staff/add-dish ok
  async postAddDish(req, res) {
    const { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const { category, name, price, status } = req.body;
    const dish = {
      tenMonAn: name,
      gia: price,
      maPhanMuc: category,
      trangThaiPhucVu: status,
    };
    await MonAn.add(dish);
    res.redirect("/");
  }

  // [GET] /staff/update-dish
  async updateDish(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const allMonAn = await MonAn.monAnByMaChiNhanh(user.MaChiNhanh);
    res.render("staff/dishUpdate", {
      title: "Update Dish",
      user,
      role,
      allMonAn,
    });
  }

  // [GET] /staff/update-dish/:id
  async renderUpdateDishWithId(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const { id } = req.params;
    const monAn = await MonAn.one(id);
    const MaKhuVuc = await KhuVuc.maKhuVuc(monAn.MaMon);
    const phanMuc = await KhuVuc.phanMucs(MaKhuVuc);
    res.render("staff/updateDishByID", {
      title: "Update Dish",
      user,
      role,
      monAn,
      phanMuc,
    });
  }

  // [POST] /staff/update-dish/:id ok
  async updateDishWithId(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    const { TENMON, GIA, MAPHANMUC, TRANGTHAIPHUCVU } = req.body;

    await MonAn.update(id, {
      tenMonAn: TENMON,
      gia: GIA,
      maPhanMuc: MAPHANMUC,
      trangThaiPhucVu: TRANGTHAIPHUCVU === "1" ? 1 : 0,
    });
    res.redirect("/staff/update-dish");
  }

  // [POST] /staff/dish-search/:page ok
  async dishSearch(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const { query } = req.body;

    const currentPage = parseInt(req.params.page) || 1;
    const allMonAn = await MonAn.search(query);

    res.render("staff/dishSearch", {
      title: "Dish Searching",
      user,
      role,
      allMonAn,
    });
  }

  // [GET] /staff/booking
  async renderBooking(req, res) {
    let { email, role } = req;
    const maNhanVien = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(maNhanVien);

    const allMonAn = await MonAn.monAnByMaChiNhanh(user.MaChiNhanh);
    res.render("staff/dishBooking", { title: "Booking", user, role, allMonAn });
  }

  // [POST] /staff/booking
  async booking(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { table, name, cccd, gender, phone, memberCard, total, dishes } =
      req.body.data;
    const cusEmail = req.body.data.email;

    if (memberCard || memberCard === "") {
      const theKhachHang = await KhachHang.oneByTheKhachHang(memberCard);
      if (!theKhachHang) {
        return res.json({
          error: true,
          type: "danger",
          message: "Thông tin không hợp lệ",
        });
      }
      const maKhachHang = theKhachHang.MaKhachHang;
      const { MaPhieu } = await NhanVien.addOrder(staffId, maKhachHang);
      dishes.forEach(async (dish) => {
        await NhanVien.addOrderDetail(MaPhieu, dish.id, dish.quantity);
      });
    } else {
      await KhachHang.add({
        tenKhachHang: name,
        soDienThoai: phone,
        gioiTinh: gender,
        CCCD: cccd,
        email: cusEmail,
      });
      const maKhachHang = await KhachHang.one(cusEmail).MaKhachHang;
      const { MaPhieu } = await NhanVien.addOrder(staffId, maKhachHang);
      dishes.forEach(async (dish) => {
        await NhanVien.addOrderDetail(MaPhieu, dish.id, dish.quantity);
      });
    }

    res.json({ error: false, message: "Đặt bàn thành công" });
  }

  // [GET] /staff/statistics/revenue
  async renderRevenueStatistics(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    let type, startDate, endDate;
    type = "day";
    startDate = new Date().toISOString().split("T")[0];
    endDate = new Date().toISOString().split("T")[0];
    let revenueStats = await ChiNhanh.revenueStats(
      user.MaChiNhanh,
      startDate,
      endDate,
      type
    );
    res.render("staff/statistics/revenue", {
      title: "Revenue Statistics",
      startDate,
      endDate,
      type,
      revenueStats,
      user,
      role,
      statType: "ngay",
    });
  }

  // [POST] /staff/statistics/revenue
  async getRevenueStatistics(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { statType, startDate, endDate } = req.body;
    let revenueStats = await ChiNhanh.revenueStats(
      user.MaChiNhanh,
      startDate,
      endDate,
      statType
    );
    if (statType === "ngay") {
      revenueStats.forEach((stat) => {
        stat.ThoiGian = new Date(stat.ThoiGian).toISOString().split("T")[0];
      });
    }
    res.json({ revenueStats });
  }

  // [GET] /staff/statistics/service xxx sửa lại dữ liệu employeeStats cho đúng
  async renderServiceStatistics(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);
    let employeeStats = [];

    res.render("staff/statistics/service", {
      title: "Employee Statistics",
      employeeStats,
      user,
      role,
      id: "",
      day: "",
      month: "",
      year: "",
    });
  }

  // [POST] /staff/statistics/service xxx sửa lại dữ liệu employeeStats cho đúng
  async getServiceStatistics(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id, day, month, year } = req.body;
    let employeeStats = await NhanVien.getServicePoint(id, day, month, year);
    if (employeeStats === false) {
      employeeStats = [];
    }

    res.render("staff/statistics/service", {
      title: "Employee Statistics",
      employeeStats,
      user,
      role,
      id,
      day,
      month,
      year,
    });
  }

  // [GET] /staff/statistics/employee ok
  async renderEmployeeStatistics(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const allKhuVuc = await KhuVuc.all();
    const chiNhanh = {};
    for (const cur of allKhuVuc) {
      const chiNhanhs = await KhuVuc.chiNhanhs(cur.MaKhuVuc);
      chiNhanh[cur.MaKhuVuc] = chiNhanhs.map((cn) => cn);
    }
    const employees = [];

    res.render("staff/statistics/employee", {
      title: "Employee Statistics",
      allKhuVuc,
      chiNhanh,
      employees,
      user,
      role,
    });
  }

  // [POST] /staff/statistics/employee ok
  async searhStaff(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { query, branch } = req.body;

    const allKhuVuc = await KhuVuc.all();
    const chiNhanh = {};
    for (const cur of allKhuVuc) {
      const chiNhanhs = await KhuVuc.chiNhanhs(cur.MaKhuVuc);
      chiNhanh[cur.MaKhuVuc] = chiNhanhs.map((cn) => cn);
    }

    const employees = await NhanVien.search(branch, query);
    employees.forEach((employee) => {
      employee.NgayVaoLam = new Date(employee.NgayVaoLam)
        .toISOString()
        .split("T")[0];
    });
    let toast = {};
    if (employees.length === 0) {
      toast = {
        type: "warning",
        message: "Không tìm thấy nhân viên nào",
      };
    } else {
      toast = {
        type: "success",
        message: "Tìm thấy " + employees.length + " nhân viên",
      };
    }
    res.render("staff/statistics/employee", {
      title: "Employee Statistics",
      allKhuVuc,
      chiNhanh,
      employees,
      user,
      toast,
      role,
    });
  }

  // [GET] /staff/statistics/invoice ok
  async renderInvoices(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const totalPages = 1;
    const currentPage = parseInt(req.params.page) || 1;

    const invoices = [];
    res.render("staff/statistics/invoice", {
      title: "Invoices",
      invoices,
      totalPages,
      currentPage,
      user,
      role,
    });
  }

  // [POST] /staff/statistics/invoice
  async searchInvoices(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { maKhachHang, ngayLap } = req.body;
    ngayLap ? ngayLap : null;
    const totalPages = 1;
    const currentPage = parseInt(req.params.page) || 1;

    const invoices = await KhachHang.bill(maKhachHang, ngayLap);
    let toast = {};
    if (invoices.length === 0) {
      toast = {
        type: "warning",
        message: "Không tìm thấy hóa đơn nào",
      };
    } else {
      toast = {
        type: "success",
        message: "Tìm thấy " + invoices.length + " hóa đơn",
      };
    }
    res.render("staff/statistics/invoice", {
      title: "Invoices",
      invoices,
      totalPages,
      currentPage,
      user,
      role,
      toast,
    });
  }

  // [GET] /staff/statistics/order ok
  async renderOrders(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    if (req.params.query) {
      var { ngayLap, maNhanVien, maKhachHang } = req.params.query;
    } else {
      var ngayLap = "";
      var maNhanVien = "";
      var maKhachHang = "";
    }

    const currentPage = parseInt(req.params.page) || 1;
    const orders = PhieuDat.search(
      maKhachHang,
      ngayLap,
      maNhanVien,
      (currentPage - 1) * PER_PAGE
    );
    const totalPages = orders.length / PER_PAGE;

    res.render("staff/statistics/order", {
      title: "Orders",
      orders,
      ngayLap,
      maNhanVien,
      maKhachHang,
      totalPages,
      currentPage,
      user,
      role,
    });
  }

  // [POST] /staff/statistics/order
  async searchOrders(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { maKhachHang, ngayLap, maNhanVien } = req.body;
    const currentPage = parseInt(req.params.page) || 1;

    const orders = await PhieuDat.search(maKhachHang, ngayLap, maNhanVien);
    if (orders.length === 0) {
      var toast = {
        type: "warning",
        message: "Không tìm thấy đơn hàng nào",
      };
    } else {
      var toast = {
        type: "success",
        message: "Tìm thấy " + orders.length + " đơn hàng",
      };
    }
    const totalPages = orders.length / PER_PAGE;
    res.render("staff/statistics/order", {
      title: "Orders",
      orders,
      ngayLap,
      maKhachHang,
      maNhanVien,
      totalPages,
      currentPage,
      user,
      role,
      toast,
    });
  }

  // [GET] /staff/statistics/edit-order/:id
  async renderEditOrder(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    const order = await PhieuDat.one(id);
    order.NgayLap = new Date(order.NgayLap).toISOString().split("T")[0];
    res.render("staff/statistics/editOrder", {
      title: "Edit Order",
      order,
      user,
      role,
    });
  }

  // [POST] /staff/statistics/edit-order/:id
  async editOrder(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    const { ngayLap, maNhanVien, maKhachHang } = req.body;

    const rs = await PhieuDat.update(id, ngayLap, maNhanVien, maKhachHang);
    if (rs.err) {
      const toast = {
        type: "danger",
        message: "Có lỗi xảy ra",
      };
      return res.render("staff/statistics/editOrder", {
        title: "Edit Order",
        order: {
          MaPhieuDat: id,
          NgayLap: ngayLap,
          MaNhanVien: maNhanVien,
          MaKhachHang: maKhachHang,
        },
        user,
        role,
        toast,
      });
    }

    res.redirect("/staff/orders");
  }

  async deleteOrder(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    await PhieuDat.delete(id);
    res.redirect("/staff/orders/1");
  }

  // [GET] /staff/customer-card/:page ok
  async renderCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const currentPage = parseInt(req.params.page) || 1;
    const query = "";

    const cards = [];
    res.render("staff/statistics/customerCard", {
      title: "Customer Card",
      cards,
      query,
      user,
      role,
    });
  }

  // [POST] /staff/customer-card/search
  async searchCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { query } = req.body;
    const currentPage = parseInt(req.params.page) || 1;
    const totalPages = 0;

    const cards = await KhachHang.searchTheKhachHang(query);
    cards.forEach((card) => {
      card.NgayLap = new Date(card.NgayLap).toISOString().split("T")[0];
      card.NgayHetHan
        ? (card.NgayHetHan = new Date(card.NgayHetHan)
            .toISOString()
            .split("T")[0])
        : null;
    });
    res.render("staff/statistics/customerCard", {
      title: "Customer Card",
      cards,
      query,
      totalPages,
      currentPage,
      user,
      role,
    });
  }

  // [GET] /staff/customer-card/add ok
  async renderAddCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    res.render("staff/statistics/addCustomerCard", {
      title: "Add Customer Card",
      user,
      role,
    });
  }

  // [POST] /staff/customer-card/add
  async addCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { MAKHACHHANG } = req.body;

    const theKhachHang = await KhachHang.oneById(MAKHACHHANG);
    if (!theKhachHang) {
      return res.json({ success: false, message: "Không tìm thấy khách hàng" });
    }

    if (!(await KhachHang.addTheKhachHang(MAKHACHHANG))) {
      return res.json({ success: false, message: "Khách hàng đã có thẻ" });
    }
    res.json({ success: true, message: "Thêm thẻ khách hàng thành công" });
  }

  async renderEditCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    const customerCard = await KhachHang.oneTheKhachHang(id);
    customerCard.NgayLap = new Date(customerCard.NgayLap)
      .toISOString()
      .split("T")[0];
    customerCard.NgayHetHan
      ? (customerCard.NgayHetHan = new Date(customerCard.NgayHetHan)
          .toISOString()
          .split("T")[0])
      : null;
    res.render("staff/statistics/editCustomerCard", {
      title: "Edit Customer Card",
      customerCard,
      user,
      role,
    });
  }

  async editCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    const { NGAYHETHAN, DIEMTICHLUY, TRANGTHAI, LOAITHE } = req.body;
    if (
      !(await KhachHang.updateTheKhachHang(
        id,
        NGAYHETHAN,
        DIEMTICHLUY,
        TRANGTHAI,
        LOAITHE
      ))
    ) {
      const customerCard = await KhachHang.oneTheKhachHang(id);
      customerCard.NgayLap = new Date(customerCard.NgayLap)
        .toISOString()
        .split("T")[0];
      customerCard.NgayHetHan
        ? (customerCard.NgayHetHan = new Date(customerCard.NgayHetHan)
            .toISOString()
            .split("T")[0])
        : null;
      const toast = {
        type: "danger",
        message: "Thông tin không hợp lệ",
      };
      return res.render("staff/statistics/editCustomerCard", {
        title: "Edit Customer Card",
        customerCard,
        user,
        role,
        toast,
      });
    }
    res.redirect("/staff/customer-card/1");
  }

  async deleteCustomerCard(req, res) {
    let { email, role } = req;
    const staffId = await NhanVien.getMaNhanVienByEmail(email);
    const user = await NhanVien.one(staffId);

    const { id } = req.params;
    await KhachHang.deleteTheKhachHang(id);
    res.redirect("/staff/customer-card/1");
  }

  // [POST] /staff/customer-card
  async checkCustomerCard(req, res) {
    const { card } = req.body;
    const theKhachHang = await KhachHang.oneByTheKhachHang(card);
    if (theKhachHang) {
      return res.json({ type: "success", message: "Thẻ khách hàng hợp lệ" });
    } else {
      return res.json({
        type: "danger",
        message: "Thẻ khách hàng không hợp lệ",
      });
    }
  }
}

module.exports = new staffController();
