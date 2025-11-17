// 示例电影数据
const sampleMovies = [
    {
        id: "1",
        title: "肖申克的救赎",
        director: "弗兰克·德拉邦特",
        release_year: 1994,
        description: "银行家安迪被冤枉杀害妻子及其情人，被判无期徒刑，在肖申克监狱中，他凭借自己的知识和毅力，最终成功越狱并获得自由。",
        poster_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300",
        created_at: "2024-01-01T00:00:00Z"
    },
    {
        id: "2", 
        title: "阿甘正传",
        director: "罗伯特·泽米吉斯",
        release_year: 1994,
        description: "先天智障的小镇男孩福瑞斯特·甘自强不息，最终在多个领域创造奇迹的励志故事。",
        poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300",
        created_at: "2024-01-02T00:00:00Z"
    },
    {
        id: "3",
        title: "泰坦尼克号", 
        director: "詹姆斯·卡梅隆",
        release_year: 1997,
        description: "穷画家杰克和贵族女露丝在泰坦尼克号上相遇相爱，最终随着巨轮沉没而永别的爱情故事。",
        poster_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300",
        created_at: "2024-01-03T00:00:00Z"
    },
    {
        id: "4",
        title: "盗梦空间",
        director: "克里斯托弗·诺兰", 
        release_year: 2010,
        description: "盗梦者柯布带领团队进入他人梦境，植入思想，展开一场惊心动魄的科幻冒险。",
        poster_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300",
        created_at: "2024-01-04T00:00:00Z"
    },
    {
        id: "5",
        title: "星际穿越",
        director: "克里斯托弗·诺兰",
        release_year: 2014,
        description: "一组宇航员穿越虫洞，为人类寻找新家园的太空探索故事。",
        poster_url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300",
        created_at: "2024-01-05T00:00:00Z"
    }
];

// 示例活动数据
const sampleActivities = [
    {
        id: "1",
        user_id: "user1",
        movie_id: "1", 
        status: "watched",
        rating: 5,
        created_at: "2024-01-06T10:00:00Z",
        movies: {
            title: "肖申克的救赎",
            poster_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300"
        },
        profiles: {
            username: "电影爱好者",
            avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        }
    },
    {
        id: "2",
        user_id: "user2",
        movie_id: "2",
        status: "favorite", 
        rating: 4,
        created_at: "2024-01-05T15:30:00Z",
        movies: {
            title: "阿甘正传",
            poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300"
        },
        profiles: {
            username: "影迷小张",
            avatar_url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100"
        }
    }
];

// 导出数据
window.sampleData = {
    movies: sampleMovies,
    activities: sampleActivities
};