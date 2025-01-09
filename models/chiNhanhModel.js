const { sql, poolPromise } = require("../utils/db");

class ChiNhanh {
  static async all() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM CHI_NHANH");
    return result.recordset;
  }
  static async one(branchId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .query("SELECT * FROM CHI_NHANH WHERE MaChiNhanh = @maChiNhanh");

    return result.recordset[0];
  }
  static async revenueStats(branchId, startDate, endDate, statType) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("maChiNhanh", sql.VarChar, branchId)
        .input("ngayBD", sql.Date, startDate)
        .input("ngayKT", sql.Date, endDate)
        .input("loaiThongKe", sql.VarChar, statType)
        .execute("sp_ThongKeDoanhThuChiNhanh");

      return result.recordset || [];
    } catch (error) {
      console.log(error.message);
    }
  }
  static async menuStats(branchId, startDate, endDate) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .input("ngayBD", sql.Date, startDate)
      .input("ngayKT", sql.Date, endDate)
      .execute("sp_ThongKeDoanhThuMonAn");

    return result.recordset;
  }

  static async highestDishes(branchId, startDate, endDate) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .input("ngayBD", sql.Date, startDate)
      .input("ngayKT", sql.Date, endDate)
      .execute("sp_ThongKeMonBanChayNhat");

    return result.recordset;
  }

  static async lowestDishes(branchId, startDate, endDate) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .input("ngayBD", sql.Date, startDate)
      .input("ngayKT", sql.Date, endDate)
      .execute("sp_ThongKeMonBanChamNhat");

    return result.recordset;
  }

  static async employees(branchId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .execute("sp_LayDanhSachNhanVien");

    return result.recordset;
  }

  static async tableBooking(branchId, numberOfPeople, date, note, customerId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, branchId)
      .input("soLuongNguoi", sql.Int, numberOfPeople)
      .input("ngay", sql.DateTime, date)
      .input("ghiChu", sql.NVarChar, note)
      .input("maKhachHang", sql.VarChar, customerId)
      .input("ngayTao", sql.DateTime, new Date())
      .execute("sp_DatBan");

    return result.recordset;
  }
}

module.exports = ChiNhanh;
