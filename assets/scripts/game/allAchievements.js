(function () {
  const achievements = [];

  const addCounterSeries = (category, names, descriptions, progressType, targets) => {
    names.forEach((name, index) => {
      const target = targets[index];
      achievements.push({
        id: `${category}.${index + 1}`,
        category,
        name,
        description: typeof descriptions === "function"
          ? descriptions(target, index)
          : (descriptions[index] || descriptions[0]),
        progress: { type: progressType, target }
      });
    });
  };

  const mainLevels = [
    ["level_1", "Stereo Madness", "Stereo Bump", "Stereo Madness!"],
    ["level_2", "Back On Track", "On my way", "Back On Track!"],
    ["level_3", "Polargeist", "Polarbear", "Polargeist!"],
    ["level_4", "Dry Out", "Dehydrated", "Dry Out!"],
    ["level_5", "Base After Base", "All your base...", "Base After Base!"],
    ["level_6", "Can't Let Go", "Hold on", "Can't Let Go!"],
    ["level_7", "Jumper", "Hop Hop...", "Jumper!"],
    ["level_8", "Time Machine", "Tick Tock", "Time Machine!"],
    ["level_9", "Cycles", "Loops", "Cycles!"],
    ["level_10", "xStep", "yStep", "xStep!"],
    ["level_11", "Clutterfunk", "Funky", "Clutterfunk!"],
    ["level_12", "Theory of Everything", "Theory of Something", "Theory of Everything!"],
    ["level_13", "Electroman Adventures", "Electro Time", "Electroman Adventures!"],
    ["level_14", "Clubstep", "Clubbin", "Clubstep!"],
    ["level_15", "Electrodynamix", "Electromaniac", "Electrodynamix!"],
    ["level_16", "Hexagon Force", "Hexagonest", "Hexagon Force!"],
    ["level_17", "Blast Processing", "Blast Power", "Blast Processing!"],
    ["level_18", "Theory of Everything 2", "Second Theory", "Theory of Everything 2!"],
    ["level_19", "Geometrical Dominator", "Geometry Warrior", "Geometrical Dominator!"],
    ["level_20", "Deadlocked", "Living Open", "Deadlocked!"],
    ["level_21", "Fingerdash", "Fingerdash", "Fingerdash!"]
  ];

  mainLevels.forEach(([levelId, levelName, practiceName, normalName]) => {
    achievements.push({
      id: `main.${levelId}.practice`,
      category: "Main levels",
      name: practiceName,
      description: `Complete '${levelName}' in Practice mode`,
      progress: { type: "levelPercent", mode: "practice", levelId, target: 100 }
    });
    achievements.push({
      id: `main.${levelId}.normal`,
      category: "Main levels",
      name: normalName,
      description: `Complete '${levelName}' in Normal mode`,
      progress: { type: "levelPercent", mode: "normal", levelId, target: 100 }
    });
  });

  addCounterSeries(
    "Insane levels",
    ["No Turning Back", "Resolve", "Edge of Madness", "Growing Insane", "InsanitY", "Sanity Pending", "I hear voices", "My head hurts", "You are INSANE", "Beyond Insanity"],
    (target) => `Complete ${target} Insane difficulty rated level${target === 1 ? "" : "s"} in Normal mode`,
    "insaneLevels",
    [5, 10, 25, 50, 75, 100, 200, 300, 400, 500]
  );

  addCounterSeries(
    "Demon levels",
    ["Reflex Champion", "Demon Chaser", "The One", "Demon Master", "Demonic Guardian", "Demonic Overmind", "Master of Timing", "Unstoppable!", "Demolicious!", "Give me a CHALLENGE!", "Grim Reaper", "You fear nothing", "Like the devil", "Speed Demon", "9 circles of hell", "Is it over yet?", "Supersonic speed", "Straight fly master", "RIP AND TEAR", "Gotta beat them all", "Deal with the devil", "This is a nightmare", "The Chosen One", "What a bloodbath", "Tarsorado Demon", "Insatiable bloodlust", "GG! :)"],
    (target) => `Complete ${target} Demon difficulty level${target === 1 ? "" : "s"} in Normal mode`,
    "demonLevels",
    [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 225, 250, 300, 350, 400, 500]
  );

  [
    ["Ultimate Clubstep", "Collect all 3 coins on 'Clubstep'", "level_14"],
    ["Ultimate TOE2", "Collect all 3 coins on 'Theory of Everything 2'", "level_18"],
    ["Ultimate Deadlocked", "Collect all 3 coins on 'Deadlocked'", "level_20"]
  ].forEach(([name, description, levelId], index) => {
    achievements.push({
      id: `ultimate-demon.${index + 1}`,
      category: "Ultimate Demon levels",
      name,
      description,
      progress: { type: "levelSecretCoins", levelId, target: 3 }
    });
  });

  addCounterSeries(
    "Secret coins",
    ["Coins?!", "Maybe behind that block?", "I.. Need... MORE!", "We wants it!", "We needs it!", "Must have the precious", "They stole it from us!", "Where Is It?! Where Is It!?", "Thief, thief, thief!", "My Precious...", "There's more!?", "Found it under a rock!"],
    (target) => `Collect ${target} Secret Coins`,
    "secretCoins",
    [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
  );

  addCounterSeries(
    "User coins",
    ["What are those!?", "The journey begins...", "I can't stop!", "Mom, get the camera!!!", "I feel rich!", "What to buy...", "i'll get that for you", "Piece of cake", "We're gonna need a bigger boat", "Got coins?", "So... greed much?", "MAX COINS!", "Just kidding...", "I think there's one left", "Where did you get those?", "So many shinies...", "Power level increasing", "Ultra mega coin catcher", "Something that rhymes with coin", "Will you ever be satisfied?", "Level up! Ultra Greedy...", "Something funny about coins", "Who makes these?", "More coins, give reward", "Much coin, very wow", "Who has this many coins?", "Enough is enough", "Stop collecting coins", "Y u take all coin?", "Can I have some?", "Congratulations, you have them all!", "You have them all again! :O", "Just kidding again!", "The other side of the coin", "Just a coin toss away", "Almighty dollar", "Have fun, kid!", "Nickel and dime", "Heads or tails", "Swag"],
    (target) => `Collect ${target.toLocaleString("en-US")} User Coin${target === 1 ? "" : "s"}`,
    "userCoins",
    [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225, 250, 300, 350, 425, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2300, 2600, 3000]
  );

  addCounterSeries(
    "User levels",
    ["Challenger", "Master", "The Gamer", "Geometrician", "Spike dodger", "No match for me!", "Bring me their heads!", "Tonight, we dine in GEOMETRY DASH!", "Keep going...", "No Title!", "You beat them all", "Ultimate Dasher", "Secret way!", "Look yonder, kid"],
    (target) => `Complete ${target.toLocaleString("en-US")} user created level${target === 1 ? "" : "s"} in Normal mode`,
    "userLevels",
    [1, 10, 50, 100, 200, 300, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000]
  );

  addCounterSeries(
    "Jumps",
    ["Bounce", "I like jumping", "You jump like a pro!", "Hop Hop Hop", "Can't stop jumping!!!", "Jumper", "You need to rest...", "Jumpman", "One hop this time!", "Leaps and bounds", "Jump King"],
    (target) => `Jump ${target.toLocaleString("en-US")} times`,
    "jumps",
    [1000, 10000, 20000, 50000, 100000, 200000, 300000, 400000, 500000, 750000, 1000000]
  );

  addCounterSeries(
    "Attempts",
    ["Trial and error", "Crash Tester", "You Shall Not Pass!", "Ouch...", "That hurts!", "Never Give Up", "Never Surrender", "Mom said it's my turn", "If at first you don't succeed", "Stop Trying", "This could become a meme", "Take a break!", "Made an attempt", "This is the one"],
    (target) => `Do ${target.toLocaleString("en-US")} attempts`,
    "attempts",
    [100, 500, 2000, 10000, 20000, 30000, 40000, 60000, 80000, 100000, 135000, 185000, 250000, 300000]
  );

  achievements.push({
    id: "misc.so-close",
    category: "Miscellaneous",
    name: "So close",
    description: "Crash at over 95% on a main level in Normal mode",
    progress: { type: "flag", key: "gd_soClose", target: 1 }
  });

  const iconPool = [];
  const iconTypes = [
    ["cube", "player", 248],
    ["ship", "ship", 79],
    ["ball", "player_ball", 52],
    ["ufo", "bird", 51],
    ["wave", "dart", 35]
  ];
  iconTypes.forEach(([type, prefix, count]) => {
    for (let id = 1; id <= count; id++) {
      iconPool.push({ type, frame: `${prefix}_${String(id).padStart(2, "0")}_001.png` });
    }
  });

  // A fixed seeded shuffle keeps placeholder art random-looking but stable between visits.
  let seed = 0x57444253;
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let index = iconPool.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [iconPool[index], iconPool[swapIndex]] = [iconPool[swapIndex], iconPool[index]];
  }

  achievements.forEach((achievement, index) => {
    achievement.icon = iconPool[index];
  });

  const readNumber = (key) => {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };

  const readArray = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_error) {
      return [];
    }
  };

  const getCompletedOnlineLevels = () => {
    const recorded = readArray("gd_completedOnlineLevels");
    const byId = new Map();
    recorded.forEach((level) => {
      if (!level || level.id === undefined || level.id === null) return;
      byId.set(String(level.id), level);
    });
    readArray("gd_completedSet")
      .filter((levelId) => String(levelId).startsWith("online_"))
      .forEach((levelId) => {
        const id = String(levelId);
        if (!byId.has(id)) byId.set(id, { id, difficulty: null, stars: null });
      });
    return [...byId.values()];
  };

  const getDemonCount = () => {
    const completedMain = new Set(readArray("gd_completedSet").map(String));
    const officialDemons = ["level_14", "level_18", "level_20"]
      .filter((levelId) => completedMain.has(levelId)).length;
    const onlineDemons = getCompletedOnlineLevels().filter((level) => {
      const difficulty = Number(level.difficulty);
      const stars = Number(level.stars);
      return difficulty >= 6 && difficulty <= 10 && (!Number.isFinite(stars) || stars > 0);
    }).length;
    return officialDemons + onlineDemons;
  };

  const currentValueFor = (achievement) => {
    const progress = achievement.progress || {};
    switch (progress.type) {
      case "levelPercent": {
        const prefix = progress.mode === "practice" ? "practiceBestPercent_" : "bestPercent_";
        return readNumber(prefix + progress.levelId);
      }
      case "levelSecretCoins":
        return readArray(`gd_secretCoins_${progress.levelId}`).length;
      case "insaneLevels":
        return getCompletedOnlineLevels().filter((level) => {
          const stars = Number(level.stars);
          return Number(level.difficulty) === 5 && (!Number.isFinite(stars) || stars > 0);
        }).length;
      case "demonLevels":
        return getDemonCount();
      case "secretCoins":
        return readNumber("gd_totalsecretcoins");
      case "userCoins":
        return readNumber("gd_totalusercoins");
      case "userLevels":
        return getCompletedOnlineLevels().length;
      case "jumps":
        return readNumber("gd_totalJumps");
      case "attempts":
        return readNumber("gd_totalAttempts");
      case "flag":
        return localStorage.getItem(progress.key) === "true" ? 1 : 0;
      default:
        return 0;
    }
  };

  window.allAchievements = achievements;
  window.AchievementProgress = {
    evaluate(achievement) {
      const target = Math.max(1, Number(achievement?.progress?.target) || 1);
      const current = Math.max(0, currentValueFor(achievement));
      return {
        current,
        target,
        percent: Math.min(100, Math.floor((current / target) * 100)),
        completed: current >= target,
        showPercent: current > 0 && current < target && achievement?.progress?.type !== "flag"
      };
    }
  };
})();
