// src/utils/vietnamLocations.js

const BASE_API = 'https://provinces.open-api.vn/api';

// 1. Lấy danh sách Tỉnh/Thành phố
export const getProvinces = async () => {
    try {
        const response = await fetch(`${BASE_API}/p/`);
        const data = await response.json();
        return data.map(p => ({ code: p.code, name: p.name }));
    } catch (error) {
        console.error('Lỗi load tỉnh:', error);
        return [];
    }
};

// 2. Lấy danh sách Quận/Huyện theo mã Tỉnh
export const getDistricts = async (provinceCode) => {
    try {
        const response = await fetch(`${BASE_API}/p/${provinceCode}?depth=2`);
        const data = await response.json();
        return data.districts.map(d => ({ code: d.code, name: d.name }));
    } catch (error) {
        console.error('Lỗi load quận:', error);
        return [];
    }
};

// 3. Lấy danh sách Phường/Xã theo mã Quận
export const getWards = async (districtCode) => {
    try {
        const response = await fetch(`${BASE_API}/d/${districtCode}?depth=2`);
        const data = await response.json();
        return data.wards.map(w => ({ code: w.code, name: w.name }));
    } catch (error) {
        console.error('Lỗi load phường:', error);
        return [];
    }
};