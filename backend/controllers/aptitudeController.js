const Question = require("../models/Question");
const Result = require("../models/Result");

const CATEGORIES = ["Quantitative", "Logical Reasoning", "Verbal Ability", "Technical"];

/**
 * @desc    List available categories with question counts
 * @route   GET /api/aptitude/categories
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const counts = await Question.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const map = {};
    counts.forEach((c) => {
      map[c._id] = c.count;
    });
    const data = CATEGORIES.map((name) => ({ name, count: map[name] || 0 }));
    return res.json({ success: true, categories: data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch a randomised set of questions for a test.
 *          IMPORTANT: the correct answer is never sent to the client.
 * @route   GET /api/aptitude/questions?category=Quantitative&limit=10
 * @access  Private (student)
 */
const getQuestions = async (req, res, next) => {
  try {
    const { category, limit = 10, difficulty } = req.query;

    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `A valid category is required. Options: ${CATEGORIES.join(", ")}`,
      });
    }

    const filter = { category };
    if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 25);

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parsedLimit } },
      { $project: { correctOption: 0, explanation: 0, createdBy: 0, __v: 0 } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions available for ${category}. Ask your placement officer to add some.`,
      });
    }

    return res.json({
      success: true,
      category,
      total: questions.length,
      durationSeconds: questions.length * 60, // 1 minute per question
      questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answers, auto-grade and store the result.
 * @route   POST /api/aptitude/submit
 * @access  Private (student)
 * @body    { category, timeTakenSeconds, answers: [{ questionId, selectedOption }] }
 */
const submitTest = async (req, res, next) => {
  try {
    const { category, answers, timeTakenSeconds } = req.body;

    if (!category || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "category and a non-empty answers array are required",
      });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: "No matching questions found" });
    }

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    let correctAnswers = 0;
    const graded = answers.map((a) => {
      const q = questionMap[a.questionId];
      const isCorrect = !!q && a.selectedOption === q.correctOption;
      if (isCorrect) correctAnswers += 1;
      return {
        question: a.questionId,
        selectedOption: a.selectedOption ?? null,
        isCorrect,
      };
    });

    const totalQuestions = questions.length;
    const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);

    const result = await Result.create({
      student: req.user._id,
      category,
      totalQuestions,
      correctAnswers,
      scorePercent,
      timeTakenSeconds: timeTakenSeconds || 0,
      answers: graded,
    });

    // Build a review payload so the student can see correct answers after submitting.
    const review = answers.map((a) => {
      const q = questionMap[a.questionId];
      return {
        questionId: a.questionId,
        questionText: q ? q.questionText : "Question removed",
        options: q ? q.options : [],
        selectedOption: a.selectedOption ?? null,
        correctOption: q ? q.correctOption : null,
        isCorrect: !!q && a.selectedOption === q.correctOption,
        explanation: q ? q.explanation : "",
      };
    });

    return res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      result: {
        _id: result._id,
        category,
        totalQuestions,
        correctAnswers,
        scorePercent,
        timeTakenSeconds: result.timeTakenSeconds,
        createdAt: result.createdAt,
      },
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the logged in student's test results
 * @route   GET /api/aptitude/results
 * @access  Private (student)
 */
const getResults = async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single result with full answer review
 * @route   GET /api/aptitude/results/:id
 * @access  Private (student)
 */
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id).populate({
      path: "answers.question",
      select: "questionText options correctOption explanation category",
    });

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    if (result.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this result" });
    }

    return res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getQuestions, submitTest, getResults, getResultById, CATEGORIES };
