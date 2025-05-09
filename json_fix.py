##This file fixes MLB files to include team name and city

import json
import re

# Keywords (used in regex) mapped to full team names
TEAM_KEYWORDS = {
    "angels": "los angeles angels",
    "astros": "houston astros",
    "athletics": "oakland athletics",
    "bluejays": "toronto blue jays",
    "braves": "atlanta braves",
    "brewers": "milwaukee brewers",
    "cardinals": "st. louis cardinals",
    "cubs": "chicago cubs",
    "dbacks": "arizona diamondbacks",
    "diamondbacks": "arizona diamondbacks",
    "dodgers": "los angeles dodgers",
    "giants": "san francisco giants",
    "guardians": "cleveland guardians",
    "mariners": "seattle mariners",
    "marlins": "miami marlins",
    "mets": "new york mets",
    "nationals": "washington nationals",
    "orioles": "baltimore orioles",
    "padres": "san diego padres",
    "phillies": "philadelphia phillies",
    "pirates": "pittsburgh pirates",
    "rangers": "texas rangers",
    "rays": "tampa bay rays",
    "redsox": "boston red sox",
    "reds": "cincinnati reds",
    "rockies": "colorado rockies",
    "royals": "kansas city royals",
    "tigers": "detroit tigers",
    "twins": "minnesota twins",
    "whitesox": "chicago white sox",
    "yankees": "new york yankees"
}


def add_team_names_by_regex(input_file, output_file):
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    for record in data:
        author = record.get("author", "").lower()
        matched = False
        for keyword, full_name in TEAM_KEYWORDS.items():
            if re.search(rf"\b{keyword}\b", author):
                record["team name"] = full_name
                matched = True
                break  # Stop after first match

        if not matched:
            record["team name"] = None  # Optional: tag non-team posts

    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

# Example usage
add_team_names_by_regex("social_posts.json", "mlb_instagram.json")
