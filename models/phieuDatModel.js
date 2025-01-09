const { sql, poolPromise } = require("../utils/db");

class PhieuDat {

    static async search(maKhachHang, ngayLap, maNhanVien) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('maKhachHang', sql.VarChar, maKhachHang)
                .input('ngayLap', sql.DateTime, ngayLap)
                .input('maNhanVien', sql.VarChar, maNhanVien)
                .query(`SELECT * FROM PHIEU_MUA_HANG WHERE MaKhachHang = @maKhachHang AND NgayLap = @ngayLap AND MaNhanVien = @maNhanVien`);
            return result.recordset;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async one(maPhieuDat) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('maPhieuDat', sql.VarChar, maPhieuDat)
                .query(`SELECT * FROM PHIEU_MUA_HANG WHERE MaPhieu = @maPhieuDat`);
            return result.recordset[0];
        } catch (err) {
            console.log(err);
        }
    }

    static async update(id, ngayLap, maKhachHang, maNhanVien) {
        const pool = await poolPromise;
        
        try {
            const result = await pool.request()
                .input('id', sql.VarChar, id)
                .input('ngayLap', sql.DateTime, ngayLap)
                .input('maKhachHang', sql.VarChar, maKhachHang)
                .input('maNhanVien', sql.VarChar, maNhanVien)
                .query(`UPDATE PHIEU_MUA_HANG SET NgayLap = @ngayLap, MaKhachHang = @maKhachHang, MaNhanVien = @maNhanVien WHERE MaPhieu = @id`);
            return result;
        } catch (err) {
            return { err: err };
        }
    }

    static async delete(maPhieu) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('maPhieu', sql.VarChar, maPhieu)
                .execute('sp_ThemPhieuDatMon');
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    static async add(maPhieu, ngayLap, maNhanVien, maKhachHang, maMon, soLuong) {
        const pool = await poolPromise;
        try {
            const result = await pool.request()
                .input('maPhieu', sql.VarChar, maPhieu)
                .input('ngayLap', sql.Date, ngayLap)
                .input('maKhachHang', sql.VarChar, maKhachHang)
                .input('maNhanVien', sql.VarChar, maNhanVien)
                .input('maMon', sql.VarChar, maMon)
                .input('soLuong', sql.Int, soLuong)
                .execute('sp_ThemPhieuDatMon');
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = PhieuDat;  