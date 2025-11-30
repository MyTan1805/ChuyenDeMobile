export const BADGE_CATEGORIES = {
    LEVEL: 'Cấp Độ',
    MILESTONE: 'Mốc Điểm', 
};

export const ALL_BADGES = [
    {
        id: 'green_person',
        name: 'Người Xanh',
        icon: 'leaf',
        color: '#4CAF50',
        threshold: 250, 
        category: BADGE_CATEGORIES.LEVEL,
        isTier: true, 
        level: 1,
        description: 'Đạt 250 điểm tích lũy, bạn là người bắt đầu sống xanh.'
    },
    {
        id: 'eco_helper',
        name: 'Trợ lý Eco',
        icon: 'hands-helping',
        color: '#64B5F6',
        threshold: 500, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 500 điểm tích lũy.'
    },
    {
        id: 'environmental_warrior',
        name: 'Chiến binh MT',
        icon: 'medal', 
        color: '#2F847C',
        threshold: 1000, 
        category: BADGE_CATEGORIES.LEVEL,
        isTier: true,
        level: 2,
        description: 'Đạt mốc 1000 điểm, chứng minh sự tích cực.'
    },
    
    {
        id: 'eco_expert',
        name: 'Chuyên gia Môi trường',
        icon: 'star',
        color: '#FFD700',
        threshold: 1500, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 1500 điểm tích lũy.'
    },
    {
        id: 'quiz_master_point',
        name: 'Bậc thầy Quiz',
        icon: 'book',
        color: '#7B61FF',
        threshold: 2000, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 2000 điểm tích lũy.'
    },
    {
        id: 'community_member',
        name: 'Thành viên Cộng đồng',
        icon: 'people-arrows',
        color: '#FFAB91',
        threshold: 2500, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 2500 điểm tích lũy.'
    },
    {
        id: 'clean_city',
        name: 'Thành phố Xanh',
        icon: 'city',
        color: '#607D8B',
        threshold: 3000, 
        category: BADGE_CATEGORIES.LEVEL,
        isTier: true,
        level: 3,
        description: 'Đạt mốc 3000 điểm - Cấp độ cao nhất.'
    },
    {
        id: 'super_achiever_4k',
        name: 'Siêu Thành tựu 4K',
        icon: 'rocket',
        color: '#00BCD4',
        threshold: 4000, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 4000 điểm tích lũy.'
    },
    {
        id: 'super_achiever_5k',
        name: 'Siêu Thành tựu 5K',
        icon: 'gem',
        color: '#9C27B0',
        threshold: 5000, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 5000 điểm tích lũy.'
    },
    {
        id: 'eco_legend',
        name: 'Huyền thoại Eco',
        icon: 'globe-americas',
        color: '#388E3C',
        threshold: 10000, 
        category: BADGE_CATEGORIES.MILESTONE,
        isTier: false,
        description: 'Đạt mốc 10000 điểm tích lũy.'
    },
];

export const getDetailedBadgeStatus = (stats, quizResults) => {
    const userHighScore = stats.highScore || 0;
    
    return ALL_BADGES.map(badge => {
        const isUnlocked = userHighScore >= badge.threshold;
        const currentValue = userHighScore;

        return {
            ...badge,
            unlocked: isUnlocked,
            currentValue: currentValue,
            progress: Math.min(1, currentValue / badge.threshold),
            nextThreshold: badge.threshold,
        };
    });
};

export const getCurrentTierBadge = (detailedBadges) => {
    const tierBadges = detailedBadges
        .filter(b => b.isTier && b.unlocked)
        .sort((a, b) => b.threshold - a.threshold);
        
    if (tierBadges.length > 0) {
        return tierBadges[0];
    }
    return ALL_BADGES.find(b => b.id === 'green_person'); 
}