const { sql, poolPromise } = require("../utils/db");
const bcrypt = require("bcrypt");

class User {
  static async one(email) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM USER_APP WHERE Email = @email");

    if (result.recordset.length !== 0) {
      return { VaiTro: "customer", ...result.recordset[0] };
    }

    const result2 = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM STAFF_APP WHERE Email = @email");

    if (result2.recordset.length !== 0) {
      return { VaiTro: "staff", ...result2.recordset[0] };
    }

    return null;
  }

  static async add(user) {
    const pool = await poolPromise;

    const maLonNhat = await pool
      .request()
      .query("SELECT MAX(MaUser) AS maLonNhat FROM USER_APP");

    const number = parseInt(maLonNhat.recordset[0].maLonNhat.slice(2)) + 1;
    const maUser = "US" + number.toString().padStart(6, "0");

    await pool
      .request()
      .input("maUser", sql.VarChar, maUser)
      .input("email", sql.VarChar, user.email)
      .input("matKhau", sql.VarChar, user.password)
      .input("maKhachHang", sql.VarChar, user.maKhachHang)
      .query(
        "INSERT INTO USER_APP VALUES (@maUser, @email, @matKhau, @maKhachHang)"
      );

    return await this.one(user.email);
  }
}

module.exports = User;
