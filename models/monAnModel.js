const { sql, poolPromise } = require("../utils/db");
const PER_PAGE = 8;

class MonAn {
  static async all() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM MON_AN");
    return result.recordset;
  }

  static async monAnByMaChiNhanh(maChiNhanh) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maChiNhanh", sql.VarChar, maChiNhanh)
      .execute("sp_LayThucDonChiNhanh");

    return result.recordset;
  }

  static async one(maMon) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .query("SELECT * FROM MON_AN WHERE MaMon = @maMon");
    return result.recordset[0];
  }

  static async add(monAn) {
    const pool = await poolPromise;

    const maLonNhat = await pool
      .request()
      .query("SELECT MAX(MaMon) AS maLonNhat FROM MON_AN");

    const number = parseInt(maLonNhat.recordset[0].maLonNhat.slice(2)) + 1;
    const maMon = "MA" + number.toString().padStart(4, "0");

    await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .input("tenMonAn", sql.NVarChar, monAn.tenMonAn)
      .input("gia", sql.Decimal, monAn.gia)
      .input("trangThaiPhucVu", sql.Bit, monAn.trangThaiPhucVu)
      .input("maPhanMuc", sql.VarChar, monAn.maPhanMuc)
      .execute("sp_ThemMonAn");

    return await this.one(monAn.maMon);
  }

  static async update(maMon, monAn) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .input("tenMonAn", sql.NVarChar, monAn.tenMonAn)
      .input("gia", sql.Decimal, monAn.gia)
      .input("trangThaiPhucVu", sql.Bit, monAn.trangThaiPhucVu)
      .input("maPhanMuc", sql.VarChar, monAn.maPhanMuc)
      .execute("sp_ChinhSuaMonAn");

    return await this.one(maMon);
  }

  static async delete(maMon) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .execute("sp_XoaMonAn");
  }

  static async getSearchLength(query) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("query", sql.VarChar, `%${query.toLowerCase()}%`)
      .query(
        "SELECT COUNT(*) AS total FROM MON_AN WHERE LOWER(TenMonAn) LIKE @query"
      );
    return result.recordset[0].total;
  }

  static async search(query) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("query", sql.VarChar, `%${query.toLowerCase()}%`)
      .query("SELECT * FROM MON_AN WHERE LOWER(TenMonAn) LIKE @query");
    return result.recordset;
  }

  static async getTableLength() {
    const pool = await poolPromise;
    const result = await pool.request().execute("fn_DoDaiBangMonAn");
    return result.output[""];
  }

  static async getMonAnByIndex(index) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("i", sql.Int, index)
      .input("n", sql.Int, PER_PAGE)
      .query(
        "SELECT * FROM MON_AN ORDER BY MaMon OFFSET @i ROWS FETCH NEXT @n ROWS ONLY"
      );
    return result.recordset;
  }

  // static async getSearchLength(query) {
  //   const pool = await poolPromise;
  //   const result = await pool
  //     .request()
  //     .input("query", sql.VarChar, `%${query.toLowerCase()}%`)
  //     .query("SELECT COUNT(*) AS total FROM MONAN WHERE LOWER(TENMON) LIKE @query");
  //   return result.recordset[0].total;
  // }

  static async searchMonAnByIndex(query, index) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("query", sql.VarChar, `%${query.toLowerCase()}%`)
      .input("i", sql.Int, index)
      .input("n", sql.Int, PER_PAGE)
      .execute("sp_TimKiemMonAn");

    return result.recordset;
  }

  static async getPhanMuc(maMon) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .query(
        "SELECT TenPhanMuc FROM PHAN_MUC WHERE MaPhanMuc = (SELECT MaPhanMuc FROM MON_AN WHERE MaMon = @maMon)"
      );

    return result.recordset[0].TenPhanMuc;
  }
}

module.exports = MonAn;
