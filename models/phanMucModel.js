const { sql, poolPromise } = require("../utils/db");

class PhanMuc {
    static async all() {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM PHAN_MUC");
        return result.recordset;
    }
    static async one(maPhanMuc) {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("maPhanMuc", sql.VarChar, maPhanMuc)
            .query("SELECT * FROM PHAN_MUC WHERE MaPhanMuc = @maPhanMuc");
        return result.recordset[0];
    }
}

module.exports = PhanMuc;