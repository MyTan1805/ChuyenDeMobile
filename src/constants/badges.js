// src/constants/badges.js
export const BADGE_TIERS = [
    {
        id: 'green_person',
        name: 'Người xanh',
        icon: 'leaf',
        color: '#4CAF50', // Màu xanh lá cây
        threshold: 250,   // Ngưỡng điểm 
        unlocked: false,
    },
    {
        id: 'environmental_warrior',
        name: 'Chiến binh môi trường',
        icon: 'seedling',
        color: '#2F847C', // Màu xanh thương hiệu
        threshold: 1000,  // Ngưỡng điểm
        unlocked: false,
    },
    {
        id: 'clean_city',
        name: 'Thành phố sạch',
        icon: 'city', // Icon Font Awesome 5
        color: '#607D8B', // Màu xanh xám
        threshold: 3000,  // Ngưỡng điểm
        unlocked: false,
    },
];

// Hàm kiểm tra cấp độ dựa trên Điểm cao nhất (highScore)
export const getCurrentBadgeStatus = (userPoints) => {
    const points = userPoints || 0; 
    
    return BADGE_TIERS.map(badge => ({
        ...badge,
        unlocked: points >= badge.threshold
    }));
};