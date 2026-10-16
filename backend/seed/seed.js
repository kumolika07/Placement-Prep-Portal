/**
 * Seed the database with demo data.
 *
 * Run with:  npm run seed
 * This WIPES users, questions, results and experiences and recreates them.
 */
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Question = require("../models/Question");
const Result = require("../models/Result");
const Experience = require("../models/Experience");

const questions = [
  // ---------------- Quantitative ----------------
  { category: "Quantitative", difficulty: "Easy", questionText: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctOption: 2, explanation: "15% of 200 = 0.15 x 200 = 30." },
  { category: "Quantitative", difficulty: "Easy", questionText: "A train covers 60 km in 45 minutes. What is its speed in km/h?", options: ["60 km/h", "75 km/h", "80 km/h", "90 km/h"], correctOption: 2, explanation: "45 min = 0.75 h, so 60 / 0.75 = 80 km/h." },
  { category: "Quantitative", difficulty: "Easy", questionText: "What is the LCM of 12 and 18?", options: ["24", "36", "48", "72"], correctOption: 1, explanation: "LCM(12,18) = 2^2 x 3^2 = 36." },
  { category: "Quantitative", difficulty: "Easy", questionText: "Find the average of 5, 10, 15, 20 and 25.", options: ["12", "15", "17", "20"], correctOption: 1, explanation: "(5+10+15+20+25)/5 = 75/5 = 15." },
  { category: "Quantitative", difficulty: "Medium", questionText: "An item bought for Rs. 80 is sold for Rs. 100. What is the profit percentage?", options: ["20%", "22%", "25%", "30%"], correctOption: 2, explanation: "Profit = 20, profit% = 20/80 x 100 = 25%." },
  { category: "Quantitative", difficulty: "Medium", questionText: "Simple interest on Rs. 5000 at 10% per annum for 2 years is:", options: ["Rs. 500", "Rs. 750", "Rs. 1000", "Rs. 1200"], correctOption: 2, explanation: "SI = P*R*T/100 = 5000*10*2/100 = 1000." },
  { category: "Quantitative", difficulty: "Easy", questionText: "If x + 5 = 12, what is the value of x?", options: ["5", "6", "7", "8"], correctOption: 2, explanation: "x = 12 - 5 = 7." },
  { category: "Quantitative", difficulty: "Medium", questionText: "The area of a circle with radius 7 cm (take pi = 22/7) is:", options: ["144 cm^2", "154 cm^2", "164 cm^2", "176 cm^2"], correctOption: 1, explanation: "Area = pi r^2 = 22/7 x 49 = 154 cm^2." },

  // ---------------- Logical Reasoning ----------------
  { category: "Logical Reasoning", difficulty: "Easy", questionText: "Find the next number: 2, 4, 8, 16, ?", options: ["18", "24", "30", "32"], correctOption: 3, explanation: "Each term doubles, so 16 x 2 = 32." },
  { category: "Logical Reasoning", difficulty: "Easy", questionText: "Which is the odd one out: 3, 5, 7, 9?", options: ["3", "5", "7", "9"], correctOption: 3, explanation: "9 is the only non-prime number." },
  { category: "Logical Reasoning", difficulty: "Medium", questionText: "If A=1, B=2, ..., Z=26, what is the value of the word 'CAT'?", options: ["21", "24", "26", "30"], correctOption: 1, explanation: "C=3, A=1, T=20, sum = 24." },
  { category: "Logical Reasoning", difficulty: "Medium", questionText: "Find the next number in the Fibonacci series: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "15"], correctOption: 2, explanation: "5 + 8 = 13." },
  { category: "Logical Reasoning", difficulty: "Easy", questionText: "Facing north, you turn 90 degrees to your right. Which direction are you facing now?", options: ["East", "West", "South", "North"], correctOption: 0, explanation: "From north, a right turn points east." },
  { category: "Logical Reasoning", difficulty: "Medium", questionText: "Find the next number: 2, 6, 12, 20, ?", options: ["28", "30", "32", "36"], correctOption: 1, explanation: "Differences are 4, 6, 8, 10 -> 20 + 10 = 30." },
  { category: "Logical Reasoning", difficulty: "Hard", questionText: "All roses are flowers. Some flowers fade quickly. Therefore:", options: ["All roses fade quickly", "Some roses fade quickly", "No conclusion about roses can be drawn", "Roses are not flowers"], correctOption: 2, explanation: "The premises do not force a conclusion about roses." },
  { category: "Logical Reasoning", difficulty: "Medium", questionText: "If in a code language MOUSE is written as NPVTF, how is CAT written?", options: ["DBU", "DBT", "BZU", "DAU"], correctOption: 0, explanation: "Each letter shifts forward by one: C->D, A->B, T->U." },

  // ---------------- Verbal Ability ----------------
  { category: "Verbal Ability", difficulty: "Easy", questionText: "Choose the synonym of 'abundant'.", options: ["Scarce", "Plentiful", "Rare", "Empty"], correctOption: 1, explanation: "Abundant means existing in large quantities, i.e. plentiful." },
  { category: "Verbal Ability", difficulty: "Easy", questionText: "Choose the antonym of 'scarce'.", options: ["Rare", "Limited", "Abundant", "Few"], correctOption: 2, explanation: "Scarce means in short supply; its opposite is abundant." },
  { category: "Verbal Ability", difficulty: "Easy", questionText: "Choose the correctly spelt word.", options: ["Neccessary", "Necesary", "Necessary", "Necessarry"], correctOption: 2, explanation: "The correct spelling is 'Necessary'." },
  { category: "Verbal Ability", difficulty: "Easy", questionText: "Fill in the blank: He ____ to school every day.", options: ["go", "goes", "going", "gone"], correctOption: 1, explanation: "Third person singular takes 'goes'." },
  { category: "Verbal Ability", difficulty: "Medium", questionText: "One word for 'a person who studies stars and planets':", options: ["Astrologer", "Astronomer", "Geologist", "Biologist"], correctOption: 1, explanation: "An astronomer studies celestial objects." },
  { category: "Verbal Ability", difficulty: "Medium", questionText: "What does the idiom 'bite the bullet' mean?", options: ["To eat quickly", "To endure a painful situation bravely", "To start a fight", "To waste time"], correctOption: 1, explanation: "'Bite the bullet' means to face a difficult situation with courage." },
  { category: "Verbal Ability", difficulty: "Medium", questionText: "Choose the synonym of 'ubiquitous'.", options: ["Rare", "Omnipresent", "Hidden", "Temporary"], correctOption: 1, explanation: "Ubiquitous means present everywhere, i.e. omnipresent." },
  { category: "Verbal Ability", difficulty: "Hard", questionText: "Select the grammatically correct sentence.", options: ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."], correctOption: 2, explanation: "'She doesn't like coffee' is correct." },

  // ---------------- Technical ----------------
  { category: "Technical", difficulty: "Easy", questionText: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctOption: 1, explanation: "Binary search halves the search space each step: O(log n)." },
  { category: "Technical", difficulty: "Easy", questionText: "Which of the following is NOT a pillar of Object Oriented Programming?", options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"], correctOption: 2, explanation: "Compilation is not an OOP pillar." },
  { category: "Technical", difficulty: "Easy", questionText: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], correctOption: 2, explanation: "404 Not Found." },
  { category: "Technical", difficulty: "Medium", questionText: "A database primary key must be:", options: ["Unique and not null", "Nullable and unique", "Duplicate allowed", "Always numeric"], correctOption: 0, explanation: "A primary key is unique and cannot be null." },
  { category: "Technical", difficulty: "Easy", questionText: "Which data structure follows the LIFO principle?", options: ["Queue", "Stack", "Linked List", "Tree"], correctOption: 1, explanation: "A stack is Last In First Out." },
  { category: "Technical", difficulty: "Medium", questionText: "Normalization in databases is mainly used to:", options: ["Increase redundancy", "Remove redundancy", "Slow down queries", "Encrypt data"], correctOption: 1, explanation: "Normalization reduces data redundancy and anomalies." },
  { category: "Technical", difficulty: "Easy", questionText: "Which SQL keyword is used to retrieve data from a table?", options: ["GET", "SELECT", "FETCH", "PULL"], correctOption: 1, explanation: "SELECT retrieves rows." },
  { category: "Technical", difficulty: "Medium", questionText: "What is the time complexity of accessing an element in an array by index?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctOption: 0, explanation: "Array indexing is constant time." },
];

const seed = async () => {
  try {
    await connectDB();
    console.log("[seed] Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Result.deleteMany({}),
      Experience.deleteMany({}),
    ]);

    console.log("[seed] Creating users...");
    const officer = await User.create({
      name: "Dr. Anita Sharma",
      username: "officer1",
      email: "officer1@college.edu",
      password: "officer123",
      role: "officer",
      branch: "Training & Placement Cell",
      degree: "Placement Officer",
    });

    const student1 = await User.create({
      name: "Rahul Verma",
      username: "student1",
      email: "student1@college.edu",
      password: "student123",
      role: "student",
      branch: "Computer Science",
      degree: "M.Tech",
      graduationYear: 2026,
      phone: "9876543210",
      skills: ["Data Structures", "React", "Node.js"],
    });

    const student2 = await User.create({
      name: "Priya Nair",
      username: "student2",
      email: "student2@college.edu",
      password: "student123",
      role: "student",
      branch: "Electronics",
      degree: "M.E",
      graduationYear: 2026,
      skills: ["VLSI", "C++", "Python"],
    });

    console.log(`[seed] Created ${questions.length} questions...`);
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: officer._id }))
    );

    // Give student1 some demo results.
    console.log("[seed] Creating demo results...");
    const makeResult = (student, category, correct, total) => {
      const picked = createdQuestions.filter((q) => q.category === category).slice(0, total);
      const answers = picked.map((q, idx) => {
        const isCorrect = idx < correct;
        return {
          question: q._id,
          selectedOption: isCorrect ? q.correctOption : (q.correctOption + 1) % 4,
          isCorrect,
        };
      });
      return {
        student: student._id,
        category,
        totalQuestions: picked.length,
        correctAnswers: correct,
        scorePercent: Math.round((correct / picked.length) * 100),
        timeTakenSeconds: 300 + Math.floor(Math.random() * 300),
        answers,
      };
    };

    await Result.insertMany([
      makeResult(student1, "Quantitative", 7, 8),
      makeResult(student1, "Logical Reasoning", 6, 8),
      makeResult(student1, "Verbal Ability", 8, 8),
      makeResult(student1, "Technical", 5, 8),
      makeResult(student2, "Quantitative", 5, 8),
      makeResult(student2, "Logical Reasoning", 7, 8),
    ]);

    console.log("[seed] Creating demo experiences...");
    await Experience.insertMany([
      {
        student: student1._id,
        company: "Infosys",
        role: "Systems Engineer",
        jobType: "Full Time",
        package: "6.5 LPA",
        location: "Pune",
        year: 2026,
        difficulty: "Medium",
        selectionStatus: "Selected",
        rounds: [
          { roundName: "Online Aptitude", description: "Quant, logical and verbal MCQs (60 mins)." },
          { roundName: "Technical Interview", description: "DSA, DBMS and one coding problem." },
          { roundName: "HR Interview", description: "Behavioural and situational questions." },
        ],
        content:
          "The aptitude round had 40 questions in 60 minutes. Technical round focused heavily on DBMS normalization and basic DSA. Be clear with SQL joins.",
        tips: "Revise DBMS and practice 2 coding problems daily.",
        status: "approved",
      },
      {
        student: student2._id,
        company: "TCS Digital",
        role: "Digital Developer",
        jobType: "Full Time",
        package: "7 LPA",
        location: "Bangalore",
        year: 2026,
        difficulty: "Hard",
        selectionStatus: "Selected",
        rounds: [
          { roundName: "NQT", description: "National Qualifier Test." },
          { roundName: "Technical + Managerial", description: "OOP, projects and puzzles." },
        ],
        content:
          "The NQT was time pressured. The technical round was project heavy, they drilled into whatever was on my resume.",
        tips: "Know every line of your resume thoroughly.",
        status: "pending",
      },
    ]);

    console.log("\n[seed] Done! Demo credentials:");
    console.log("  Officer -> username: officer1  password: officer123");
    console.log("  Student -> username: student1  password: student123");
    console.log("  Student -> username: student2  password: student123\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("[seed] Failed:", error);
    process.exit(1);
  }
};

seed();
