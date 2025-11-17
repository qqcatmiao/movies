// 电影详情页示例数据
const sampleMovieDetails = [
    {
        id: "1",
        title: "肖申克的救赎",
        director: "弗兰克·德拉邦特",
        release_year: 1994,
        description: "银行家安迪被冤枉杀害妻子及其情人，被判无期徒刑，在肖申克监狱中，他凭借自己的知识和毅力，最终成功越狱并获得自由。影片探讨了希望、友谊和救赎的主题。",
        poster_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300",
        duration: 142,
        genre: "剧情",
        rating: 9.7,
        created_at: "2024-01-01T00:00:00Z"
    },
    {
        id: "2", 
        title: "阿甘正传",
        director: "罗伯特·泽米吉斯",
        release_year: 1994,
        description: "先天智障的小镇男孩福瑞斯特·甘自强不息，最终在多个领域创造奇迹的励志故事。影片通过阿甘的视角展现了美国历史的重要时刻。",
        poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300",
        duration: 142,
        genre: "剧情/爱情",
        rating: 9.5,
        created_at: "2024-01-02T00:00:00Z"
    },
    {
        id: "3",
        title: "泰坦尼克号", 
        director: "詹姆斯·卡梅隆",
        release_year: 1997,
        description: "穷画家杰克和贵族女露丝在泰坦尼克号上相遇相爱，最终随着巨轮沉没而永别的爱情故事。影片展现了跨越阶级的爱情和人性的光辉。",
        poster_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300",
        duration: 195,
        genre: "爱情/灾难",
        rating: 9.4,
        created_at: "2024-01-03T00:00:00Z"
    },
    {
        id: "4",
        title: "盗梦空间",
        director: "克里斯托弗·诺兰", 
        release_year: 2010,
        description: "盗梦者柯布带领团队进入他人梦境，植入思想，展开一场惊心动魄的科幻冒险。影片探讨了现实与梦境的界限。",
        poster_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300",
        duration: 148,
        genre: "科幻/动作",
        rating: 9.3,
        created_at: "2024-01-04T00:00:00Z"
    },
    {
        id: "5",
        title: "星际穿越",
        director: "克里斯托弗·诺兰",
        release_year: 2014,
        description: "一组宇航员穿越虫洞，为人类寻找新家园的太空探索故事。影片结合了硬科幻与深刻的人文关怀。",
        poster_url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300",
        duration: 169,
        genre: "科幻/冒险",
        rating: 9.3,
        created_at: "2024-01-05T00:00:00Z"
    },
    {
        id: "6",
        title: "霸王别姬",
        director: "陈凯歌",
        release_year: 1993,
        description: "两位京剧演员跨越半个世纪的恩怨情仇，展现了中国社会的变迁和个人命运的沉浮。",
        poster_url: "https://images.unsplash.com/photo-1489599809519-f0c5d0c54358?w=300",
        duration: 171,
        genre: "剧情/爱情",
        rating: 9.6,
        created_at: "2024-01-06T00:00:00Z"
    },
    {
        id: "7",
        title: "这个杀手不太冷",
        director: "吕克·贝松",
        release_year: 1994,
        description: "职业杀手与小女孩之间特殊的情感故事，展现了人性中的温暖与救赎。",
        poster_url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300",
        duration: 110,
        genre: "剧情/动作",
        rating: 9.4,
        created_at: "2024-01-07T00:00:00Z"
    },
    {
        id: "8",
        title: "辛德勒的名单",
        director: "史蒂文·斯皮尔伯格",
        release_year: 1993,
        description: "德国商人辛德勒在二战期间拯救犹太人的真实故事，展现了人性的光辉。",
        poster_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300",
        duration: 195,
        genre: "剧情/历史",
        rating: 9.5,
        created_at: "2024-01-08T00:00:00Z"
    },
    {
        id: "9",
        title: "千与千寻",
        director: "宫崎骏",
        release_year: 2001,
        description: "小女孩千寻在神秘世界中寻找父母的故事，充满了奇幻与想象力。",
        poster_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
        duration: 125,
        genre: "动画/奇幻",
        rating: 9.3,
        created_at: "2024-01-09T00:00:00Z"
    },
    {
        id: "10",
        title: "教父",
        director: "弗朗西斯·福特·科波拉",
        release_year: 1972,
        description: "黑手党家族的故事，展现了权力、家族和人性的复杂关系。",
        poster_url: "https://images.unsplash.com/photo-1489599809519-f0c5d0c54358?w=300",
        duration: 175,
        genre: "剧情/犯罪",
        rating: 9.3,
        created_at: "2024-01-10T00:00:00Z"
    }
];

// 导出数据
window.sampleMovieDetails = sampleMovieDetails;