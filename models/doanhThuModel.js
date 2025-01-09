const { sql, poolPromise } = require("../utils/db");

class DoanhThu {
    static async getRevenueStats(startDate, endDate, branchId) {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input("ngayBatDau", sql.Date, startDate)
            .input("ngayKetThuc", sql.Date, endDate)
            .input("maChiNhanh", sql.Int, branchId)
            .execute("SP_DOANHTHU");

        return result.recordset;
    }
}