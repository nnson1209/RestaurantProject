const { sql, poolPromise } = require("../utils/db");

class KhachHang {
  static async add(khachHang) {
    const pool = await poolPromise;

    const maLonNhat = await pool
      .request()
      .query("SELECT MAX(MaKhachHang) AS maLonNhat FROM KHACH_HANG");
    const number = parseInt(maLonNhat.recordset[0].maLonNhat.slice(2)) + 1;
    const maKhachHang = "KH" + number.toString().padStart(6, "0");
    console.log(maKhachHang);

    await pool
      .request()
      .input("maKhach", sql.VarChar, maKhachHang)
      .input("tenKhach", sql.NVarChar, khachHang.name)
      .input("email", sql.VarChar, khachHang.email)
      .input("soDienThoai", sql.VarChar, khachHang.phone)
      .input("cccd", sql.NChar, khachHang.cccd)
      .input("gioiTinh", sql.NChar, khachHang.gender)
      .execute("sp_TaoKhachHang");

    return maKhachHang;
  }

  static async one(email) {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .execute("sp_LayThongTinKhachHangBangEmail");

    return result.recordset[0];
  }

  static async oneById(maKhachHang) {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("maKhachHang", sql.VarChar, maKhachHang)
      .query("SELECT * FROM KHACH_HANG WHERE MaKhachHang = @maKhachHang");

    return result.recordset[0];
  }

  static async bill(maKhachHang, ngayLap) {
    const pool = await poolPromise;

    maKhachHang = maKhachHang || null;
    ngayLap = ngayLap || null;

    console.log(maKhachHang, ngayLap);

    try {
      const result = await pool
        .request()
        .input("maKhachHang", sql.VarChar, maKhachHang)
        .input("ngay", sql.DateTime, ngayLap)
        .execute("sp_TimHoaDon");

      console.log(result.recordset);

      return result.recordset;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  static async allTheKhachHang() {
    const pool = await poolPromise;

    const result = await pool.request().query("SELECT * FROM THE_KHACH_HANG");

    return result.recordset;
  }

  static async oneTheKhachHang(maThe) {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("maThe", sql.VarChar, maThe)
      .query("SELECT * FROM THE_KHACH_HANG WHERE MaThe = @maThe");

    return result.recordset[0];
  }

  static async searchTheKhachHang(query) {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("maThe", sql.VarChar, query)
      .input("maKhachHang", sql.VarChar, null)
      .execute("sp_TimTheKhachHang");

    return result.recordset;
  }

  static async addTheKhachHang(maKhachHang) {
    const pool = await poolPromise;

    const maLonNhat = await pool
      .request()
      .query("SELECT MAX(MaThe) AS maLonNhat FROM THE_KHACH_HANG");
    const number = parseInt(maLonNhat.recordset[0].maLonNhat.slice(2)) + 1;
    const maThe = "TK" + number.toString().padStart(6, "0");

    try {
      await pool
        .request()
        .input("maThe", sql.VarChar, maThe)
        .input("maKhachHang", sql.VarChar, maKhachHang)
        .execute("sp_TaoTheKhachHang");
      return true;
    } catch (error) {
      return false;
    }
  }

  static async updateTheKhachHang(
    maThe,
    ngayHetHan,
    diemTichLuy,
    trangThai,
    loaiThe
  ) {
    try {
      const pool = await poolPromise;

      await pool
        .request()
        .input("maThe", sql.VarChar, maThe)
        .input("ngayHetHan", sql.DateTime, ngayHetHan)
        .input("diemTichLuy", sql.Int, diemTichLuy)
        .input("trangThai", sql.NVarChar, trangThai)
        .input("loaiThe", sql.NVarChar, loaiThe)
        .execute("sp_SuaTheKhachHang");

      return true;
    } catch (error) {
      return false;
    }
  }

  static async deleteTheKhachHang(maThe) {
    const pool = await poolPromise;

    await pool
      .request()
      .input("maThe", sql.VarChar, maThe)
      .execute("sp_XoaTheKhachHang");
  }

  static async oneByTheKhachHang(maThe) {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("maThe", sql.VarChar, maThe)
      .execute("sp_TimTheKhachHang");

    return result.recordset[0];
  }
}

module.exports = KhachHang;
