const { sql, poolPromise } = require("../utils/db");

class BoPhan {
  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM BOPHAN");
    return result.recordset;
  }

  static async getBoPhanByMaBoPhan(maBoPhan) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("maBoPhan", sql.VarChar, maBoPhan)
      .query("SELECT * FROM BOPHAN WHERE MABOPHAN = @maBoPhan");
    return result.recordset[0];
  }

  static async createBoPhan(boPhan) {
    const pool = await poolPromise;

    await pool
      .request()
      .input("maBoPhan", sql.VarChar, boPhan.maBoPhan)
      .input("tenBoPhan", sql.NVarChar, boPhan.tenBoPhan)
      .input("maChiNhanh", sql.VarChar, boPhan.maChiNhanh)
      .query(
        "INSERT INTO BOPHAN (MABOPHAN, TENBOPHAN, MACHINHANH) VALUES (@maBoPhan, @tenBoPhan, @maChiNhanh)"
      );

    return await this.getBoPhanByMaBoPhan(boPhan.maBoPhan);
  }

  static async updateBoPhan(maBoPhan, boPhan) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maBoPhan", sql.VarChar, maBoPhan)
      .input("tenBoPhan", sql.NVarChar, boPhan.tenBoPhan)
      .input("maChiNhanh", sql.VarChar, boPhan.maChiNhanh)
      .query(
        "UPDATE BOPHAN SET TENBOPHAN = @tenBoPhan, MACHINHANH = @maChiNhanh WHERE MABOPHAN = @maBoPhan"
      );

    return await this.getBoPhanByMaBoPhan(maBoPhan);
  }

  static async deleteBoPhan(maBoPhan) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("maBoPhan", sql.VarChar, maBoPhan)
      .query("DELETE FROM BOPHAN WHERE MABOPHAN = @maBoPhan");
  }
}

module.exports = BoPhan;
