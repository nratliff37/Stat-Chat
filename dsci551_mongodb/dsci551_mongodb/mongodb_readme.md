Created two collections for a stat_chat mongodb database
social_media.json
    contains each mlb team's team name and instagram, X, and tiktok handles
    long with followers, following, etc. 
    Structure for record is as follows:
    {
        "team": "arizona diamondbacks",
        "instagram": {
           "handle": "@dbacks",
           "following": 681,
           "followers": 672000,
           "posts": 12368
         },
         "X": {
           "handle": "dbacks",
           "following": 6082,
           "followers": 651400
         },
         "tiktok": {
           "handle": "dbacks",
           "following": 13,
           "followers": 278900,
           "likes": 3300000
         }
       },

social_posts.json
    contains collection of various instagram, X, and tiktok posts
    from 2024 season (speciifcally the year 2024). Structure is as follows:
    {
    "author": "@mlb",
    "media": "instagram",
    "caption": "The @Padres have #CLINCHED their ticket to the #postseason! 🚨",
    "date": "09-24-24",
    "likes": 94129,
    "link": "https://www.instagram.com/p/DAU9eo3uUP_/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "tagged": ["@mannymachado","@_jacksonmerrill_","@arraezluis","@dylancease7","@padres","@budweiserusa"]
},

IMPORT INSTRUCTIONS IN MONGODB
1 - upload files into server
2 - Create database (E.G. use stat_chat)
3 - Create collections from json files
mongoimport --db stat_chat --collection posts --file /home/ubuntu/social_posts.json --jsonArray
mongoimport --db stat_chat --collection socials --file /home/ubuntu/social_media.json --jsonArray
(NOTE: exact filepath might vary depending on where we store these)