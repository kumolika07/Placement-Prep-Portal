/**
 * Auto-seed guard.
 *
 * Runs once every time the server starts. It makes sure the database has:
 *   1. at least one Placement Officer account (login for the officer module)
 *   2. the aptitude question bank
 *   3. optional demo student accounts with sample results
 *
 * This is what makes a fresh deployment (e.g. on Render with a brand new
 * MongoDB Atlas cluster) usable immediately, instead of showing
 * "Not available" on every test category.
 *
 * Everything is idempotent: existing data is never overwritten.
 */
const mongoose = require("mongoose");
const User = require("../models/User");
const Question = require("../models/Question");
const Result = require("../models/Result");
const Experience = require("../models/Experience");
const questions = require("../seed/questionsData");

const OFFICER_USERNAME = (process.env.OFFICER_USERNAME || "officer1").toLowerCase();
const OFFICER_PASSWORD = process.env.OFFICER_PASSWORD || "officer123";
const OFFICER_NAME = process.env.OFFICER_NAME || "Placement Officer";
const SEED_DEMO = String(process.env.SEED_DEMO_STUDENTS || "true").toLowerCase() !== "false";

const makeResults = (student, questions) => {
  const build = (category, correct, total) => {
    const picked = questions.filter((q) => q.category === category).slice(0, total);
    const answers = picked.map((q, idx) => ({
      question: q._id,
      selectedOption: idx < correct ? q.correctOption : (q.correctOption + 1) % 4,
      isCorrect: idx < correct,
    }));
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
  return [
    build("Quantitative", 7, 8),
    build("Logical Reasoning", 6, 8),
    build("Verbal Ability", 8, 8),
    build("Technical", 5, 8),
  ];
};

const autoSeed = async () => {
  try {
    // ---------- 1. Officer account ----------
    let officer = await User.findOne({ role: "officer" });
    if (!officer) {
      officer = await User.create({
        name: OFFICER_NAME,
        username: OFFICER_USERNAME,
        email: process.env.OFFICER_EMAIL || `${OFFICER_USERNAME}@placement.edu`,
        password: OFFICER_PASSWORD,
        role: "officer",
        branch: "Training & Placement Cell",
        degree: "Placement Officer",
      });
      console.log(`[autoseed] Created officer account -> username: ${OFFICER_USERNAME} | password: ${OFFICER_PASSWORD}`);
    } else {
      console.log(`[autoseed] Officer account present -> username: ${officer.username}`);
    }

    // ---------- 2. Question bank ----------
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      const created = await Question.insertMany(
        questions.map((q) => ({ ...q, createdBy: officer._id }))
      );
      console.log(`[autoseed] Seeded ${created.length} aptitude questions`);
    } else {
      console.log(`[autoseed] Question bank already has ${questionCount} questions`);
    }

    // ---------- 3. Demo students ----------
    if (SEED_DEMO) {
      const demoSpec = [
        {
          name: "Rahul Verma",
          username: "student1",
          email: "student1@college.edu",
          password: "student123",
          branch: "Computer Science",
          degree: "M.Tech",
          graduationYear: new Date().getFullYear(),
          skills: ["Data Structures", "React", "Node.js"],
        },
        {
          name: "Priya Nair",
          username: "student2",
          email: "student2@college.edu",
          password: "student123",
          branch: "Electronics",
          degree: "M.E",
          graduationYear: new Date().getFullYear(),
          skills: ["VLSI", "C++", "Python"],
        },
      ];

      for (const spec of demoSpec) {
        let student = await User.findOne({ username: spec.username });
        if (!student) {
          student = await User.create({ ...spec, role: "student" });
          console.log(`[autoseed] Created demo student -> username: ${spec.username} | password: ${spec.password}`);

          const qs = await Question.find();
          if (qs.length) {
            await Result.insertMany(makeResults(student, qs));
          }

          await Experience.create({
            student: student._id,
            company: "Infosys",
            role: "Systems Engineer",
            jobType: "Full Time",
            package: "6.5 LPA",
            location: "Pune",
            year: new Date().getFullYear(),
            difficulty: "Medium",
            selectionStatus: "Selected",
            rounds: [
              { roundName: "Online Aptitude", description: "Quant, logical and verbal MCQs (60 mins)." },
              { roundName: "Technical Interview", description: "DSA, DBMS and one coding problem." },
              { roundName: "HR Interview", description: "Behavioural and situational questions." },
            ],
            content:
              "The aptitude round had 40 questions in 60 minutes. The technical round focused heavily on DBMS normalization and basic DSA. Be clear with SQL joins.",
            tips: "Revise DBMS and practice 2 coding problems daily.",
            status: "approved",
          });
        }
      }
    }

    console.log("[autoseed] Database is ready.");
  } catch (error) {
    console.error(`[autoseed] Skipped (${error.message})`);
  }
};

module.exports = autoSeed;
