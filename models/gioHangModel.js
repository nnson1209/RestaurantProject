const { sql, poolPromise } = require("../utils/db");
const KhachHang = require("./khachHangModel");

class GioHang {
    static async one(email, food) {
        const pool = await poolPromise;
        const khachHang = await KhachHang.one(email);

        const result = await pool
            .request()
            .input("maKhachHang", sql.VarChar, khachHang.MaKhachHang)
            .input("maMon", sql.VarChar, food)
            .query(
                "SELECT * FROM GIO_HANG WHERE MaKhachHang = @maKhachHang AND MaMon = @maMon"
            );

        return result.recordset;
    }

    static async createGioHang(email, food, staff) {
        const pool = await poolPromise;

        const check = await this.one(email, food);
        if (check.length > 0) {
            await pool
                .request()
                .input("maKhachHang", sql.VarChar, check[0].MaKhachHang)
                .input("maMon", sql.VarChar, food)
                .input("soLuong", sql.Int, check[0].SoLuong + 1)
                .query(
                    "UPDATE GIO_HANG SET SoLuong = @soLuong WHERE MaKhachHang = @maKhachHang AND MaMon = @maMon"
                );
            return;
        }

        const khachHang = await KhachHang.one(email);
        await pool
            .request()
            .input("maKhachHang", sql.VarChar, khachHang.MaKhachHang)
            .input("maMon", sql.VarChar, food)
            .input("soLuong", sql.Int, 1)
            .query(
                "INSERT INTO GIO_HANG (MaKhachHang, MaMon, SoLuong) VALUES (@maKhachHang, @maMon, @soLuong)"
            );
    }

    static async getGioHangByMaKhachHang(maKhachHang) {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("maKhach", sql.VarChar, maKhachHang)
            .execute("sp_LayGioHangCuaKhach"); 

        return result.recordset;
    }

    static async updateGioHang(maMon, maKhachHang, soLuong) {
        const pool = await poolPromise;

        await pool
            .request()
            .input("maKhachHang", sql.VarChar, maKhachHang)
            .input("maMon", sql.VarChar, maMon)
            .input("soLuong", sql.VarChar, soLuong)
            .query(
                "UPDATE GIO_HANG SET SoLuong = @soLuong WHERE MaKhachHang = @maKhachHang AND MaMon = @maMon"
            );
    }

    static async removeGioHang(maMon, maKhachHang) {
        const pool = await poolPromise;

        await pool
            .request()
            .input("maKhach", sql.VarChar, maKhachHang)
            .input("maMon", sql.VarChar, maMon)
            .execute("sp_XoaMonKhoiGioHang");
    }
}

module.exports = GioHang;
