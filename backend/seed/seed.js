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
const questions = require("./questionsData");


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
