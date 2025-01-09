const { sql, poolPromise } = require("../utils/db");

class KhuVuc {
  static async all() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM KHU_VUC");
    return result.recordset;
  }

  static async one(maKhuVuc) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maKhuVuc", sql.VarChar, maKhuVuc)
      .execute("sp_LayThongTinKhuVuc");
    return result.recordset[0];
  }

  static async add(khuVuc) {
    const pool = await poolPromise;

    await pool
      .request()
      .input("maKhuVuc", sql.VarChar, khuVuc.maKhuVuc)
      .input("tenKhuVuc", sql.NVarChar, khuVuc.tenKhuVuc)
      .execute("sp_ThemKhuVuc");

    return await this.one(khuVuc.maKhuVuc);
  }

  static async update(maKhuVuc, khuVuc) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maKhuVuc", sql.VarChar, maKhuVuc)
      .input("tenKhuVuc", sql.NVarChar, khuVuc.tenKhuVuc)
      .execute("sp_ChinhSuaKhuVuc");

    return await this.one(maKhuVuc);
  }

  static async delete(maKhuVuc) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maKhuVuc", sql.VarChar, maKhuVuc)
      .execute("sp_XoaKhuVuc");
  }

  static async chiNhanhs(maKhuVuc) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maKhuVuc", sql.VarChar, maKhuVuc)
      .execute("sp_LayDanhSachChiNhanhTrongKhuVuc");

    return result.recordset;
  }

  static async phanMucs(maKhuVuc) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maKhuVuc", sql.VarChar, maKhuVuc)
      .execute("sp_LayDanhSachPhanMucTrongKhuVuc");
    return result.recordset;
  }
  
  static async maKhuVuc(maMon) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maMon", sql.VarChar, maMon)
      .execute("sp_LayMaKhuVucCuaMonAn");

    return result.recordset[0].MaKhuVuc;
  }
}

module.exports = KhuVuc;
