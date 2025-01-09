const { sql, poolPromise } = require("../utils/db");

class NhanVien {
  static async all() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM NHAN_VIEN");
    return result.recordset;
  }

  static async getMaNhanVienByEmail(Email) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", sql.VarChar, Email)
      .query("SELECT MaNhanVien FROM STAFF_APP WHERE Email = @Email");

    return result.recordset[0].MaNhanVien;
  }

  static async one(maNhanVien) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maNhanVien", sql.Char, maNhanVien)
      .query(
        "SELECT NV.*, CN.MaChiNhanh FROM NHAN_VIEN NV JOIN BO_PHAN BP ON NV.MaBoPhan = BP.MaBoPhan JOIN CHI_NHANH CN ON BP.MaChiNhanh = CN.MaChiNhanh WHERE NV.MaNhanVien = @maNhanVien"
      );
    return result.recordset[0];
  }

  static async add(nhanVien) {
    const pool = await poolPromise;

    await pool
      .request()
      .input("tenNhanVien", sql.NVarChar, nhanVien.hoTen)
      .input("maBoPhan", sql.Char, nhanVien.maBoPhan)
      .execute("sp_ThemNhanVien");

    return await this.one(nhanVien.maNhanVien);
  }

  static async update(maNhanVien, nhanVien) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maNhanVien", sql.Char, maNhanVien)
      .input("tenNhanVien", sql.NVarChar, nhanVien.HoTen)
      .input("maBoPhan", sql.Char, nhanVien.MaBoPhan)
      .input("Luong", sql.Int, nhanVien.Luong)
      .execute("sp_SuaNhanVien");

    return await this.one(maNhanVien);
  }

  static async delete(maNhanVien) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("maNhanVien", sql.Char, maNhanVien)
        .execute("sp_XoaNhanVien");
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  static async addOrder(maNhanVien, maKhachHang) {
    const pool = await poolPromise;

    const maLonNhat = await pool
      .request()
      .query("SELECT MAX(MaPhieu) AS maLonNhat FROM PHIEU_MUA_HANG");

    console.log("Ma lon nhat: ", maLonNhat);

    const number = maLonNhat
      ? parseInt(maLonNhat.recordset[0].maLonNhat.slice(2)) + 1
      : 1;
    const maPhieuDatMon = "PM" + number.toString().padStart(6, "0");
    console.log(maPhieuDatMon);

    await pool
      .request()
      .input("maPhieu", sql.Char, maPhieuDatMon)
      .input("maNhanVien", sql.Char, maNhanVien)
      .input("ngayLap", sql.DateTime, new Date())
      .input("maKhachHang", sql.Char, maKhachHang)
      .execute("sp_ThemPhieuDatMon");

    return { MaPhieu: maPhieuDatMon };
  }

  static async addOrderDetail(maPhieuDatMon, maMonAn, soLuong) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maPhieu", sql.Char, maPhieuDatMon)
      .input("maMon", sql.Char, maMonAn)
      .input("soLuong", sql.Int, soLuong)
      .execute("sp_ThemChiTietPhieuDatMon");

    return await this.one(maPhieuDatMon);
  }

  static async search(maChiNhanh, query) {
    maChiNhanh = maChiNhanh || "all";
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("query", sql.NVarChar, query)
      .input("maChiNhanh", sql.Char, maChiNhanh)
      .execute("sp_TimKiemNhanVien");
    return result.recordset;
  }

  static async transfer(maNhanVien, hoTen, maBoPhan, Luong) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("maNhanVien", sql.Char, maNhanVien)
        .input("tenNhanVien", sql.NVarChar, hoTen)
        .input("maBoPhan", sql.Char, maBoPhan)
        .input("Luong", sql.Int, Luong)
        .execute("sp_ChuyenNhanVien");

      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  static async getServicePoint(maNhanVien, ngay, thang, nam) {
    try {
      const pool = await poolPromise;

      ngay = ngay ? parseInt(ngay) : null;
      thang = thang ? parseInt(thang) : null;
      nam = nam ? parseInt(nam) : null;

      console.log(maNhanVien, ngay, thang, nam);
      const result = await pool
        .request()
        .input("maNhanVien", sql.Char, maNhanVien)
        .input("ngay", sql.Int, ngay)
        .input("thang", sql.Int, thang)
        .input("nam", sql.Int, nam)
        .execute("sp_LayDiemDanhGiaTheoThoiGian");

      console.log(result);
      return result.recordset;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}

module.exports = NhanVien;
