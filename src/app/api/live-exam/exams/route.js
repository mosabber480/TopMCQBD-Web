import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DEFAULT_EXAMS = [
  {
    id: "bcs-46-live",
    title: "৪৬তম বিসিএস প্রিলিমিনারি লাইভ গ্র্যান্ড মডেল টেস্ট - ০১",
    category: "bcs",
    categoryName: "বিসিএস",
    badge: "BCS",
    badgeColor: "rose",
    tags: ["BCS", "বিসিএস", "46th BCS"],
    durationMinutes: 9, // 15 MCQs = 9 minutes (100 MCQs = 60 min ratio)
    totalMarks: 20,
    negativeMarking: 0.5,
    participants: 14820,
    questionsCount: 15,
    isFree: true,
    scheduledStart: "2026-09-04T00:00:00.000Z",
    scheduledEnd: "2026-09-07T00:00:00.000Z",
    status: "live", // "upcoming", "live", "ended"
    description: "৪৬তম বিসিএস প্রিলিমিনারি পরীক্ষার সর্বশেষ সিলেবাস অনুসারে প্রণীত সম্পূর্ণ মডেল টেস্ট। ব্যাখ্যামূলক সমাধান ও তাৎক্ষণিক মেরিট পজিশন।",
    questions: [
      {
        id: 1,
        question: "বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?",
        subject: "বাংলা সাহিত্য",
        options: ["মেঘনাদবধ কাব্য", "পদ্মাবতী", "বৃত্রসংহার", "মহাশ্মশান"],
        ans: 0,
        explanation: "মাইকেল মধুসূদন দত্ত রচিত 'মেঘনাদবধ কাব্য' (১৮৬১) বাংলা সাহিত্যের প্রথম সার্থক মহাকাব্য। এটি নয়টি সর্গে অমিত্রাক্ষর ছন্দে রচিত।"
      },
      {
        id: 2,
        question: "‘সূর্য’ শব্দের সমার্থক শব্দ কোনটি?",
        subject: "বাংলা ব্যাকরণ",
        options: ["সুধাংশু", "মিহির", "শশাঙ্ক", "বিধু"],
        ans: 1,
        explanation: "‘মিহির’, আদিত্য, রবি, ভাস্কর, তপন, দিনকর সূর্যের সমার্থক শব্দ। অপরপক্ষে সুধাংশু, শশাঙ্ক ও বিধু চাঁদের সমার্থক শব্দ।"
      },
      {
        id: 3,
        question: "Which one is the correct spelling?",
        subject: "English",
        options: ["Bureaucracy", "Beaurocracy", "Bureaucrasy", "Burocracy"],
        ans: 0,
        explanation: "The correct spelling is 'Bureaucracy' (আমলাতন্ত্র)। Root word: Bureau + cracy।"
      },
      {
        id: 4,
        question: "The idiom 'A hot potato' means-",
        subject: "English Idioms",
        options: ["A delicious food", "A controversial issue difficult to deal with", "An urgent meeting", "A useless thing"],
        ans: 1,
        explanation: "'A hot potato' means a controversial issue or situation that is awkward or unpleasant to deal with."
      },
      {
        id: 5,
        question: "মুজিবনগর সরকার কত তারিখে শপথ গ্রহণ করে?",
        subject: "বাংলাদেশ বিষয়াবলি",
        options: ["১০ এপ্রিল ১৯৭১", "১৭ এপ্রিল ১৯৭১", "২৫ মার্চ ১৯৭১", "২৬ মার্চ ১৯৭১"],
        ans: 1,
        explanation: "মুজিবনগর সরকার ১৯৭১ সালের ১০ এপ্রিল গঠিত হয় এবং ১৭ এপ্রিল মেহেরপুরের বৈদ্যনাথতলার ভবেরপাড়া গ্রামে (মুজিবনগর) আনুষ্ঠানিকভাবে শপথ গ্রহণ করে।"
      },
      {
        id: 6,
        question: "বাংলাদেশের সংবিধানে কতটি অনুচ্ছেদ রয়েছে?",
        subject: "বাংলাদেশ বিষয়াবলি",
        options: ["১৩৭টি", "১৫৩টি", "১৪৫টি", "১৬২টি"],
        ans: 1,
        explanation: "বাংলাদেশের সংবিধানে মোট ১৫৩টি অনুচ্ছেদ, ১১টি ভাগ এবং ৭টি তফসিল রয়েছে।"
      },
      {
        id: 7,
        question: "জাতিসংঘের বর্তমান মহাসচিব আন্তোনিও গুতেরেস কোন দেশের নাগরিক?",
        subject: "আন্তর্জাতিক বিষয়াবলি",
        options: ["স্পেন", "পর্তুগাল", "ব্রাজিল", "ইতালি"],
        ans: 1,
        explanation: "আন্তোনিও গুতেরেস পর্তুগালের সাবেক প্রধানমন্ত্রী ছিলেন এবং ২০১৭ সালের ১ জানুয়ারি জাতিসংঘের ৯ম মহাসচিব হিসেবে দায়িত্ব গ্রহণ করেন।"
      },
      {
        id: 8,
        question: "টাকায় ৩টি করে আম ক্রয় করে ২টি করে বিক্রয় করলে শতকরা কত লাভ হবে?",
        subject: "গাণিতিক যুক্তি",
        options: ["৩৩.৩৩%", "৫০%", "২৫%", "২০%"],
        ans: 1,
        explanation: "ক্রয়মূল্য ১/৩ টাকা, বিক্রয়মূল্য ১/২ টাকা। লাভ = (১/২ - ১/৩) = ১/৬ টাকা। শতকরা লাভ = (১/৬ ÷ ১/৩) × ১০০% = ৫০%।"
      },
      {
        id: 9,
        question: "যদি a + b = 5 এবং a - b = 3 হয়, তবে ab এর মান কত?",
        subject: "গাণিতিক যুক্তি",
        options: ["২", "৪", "৮", "১৬"],
        ans: 1,
        explanation: "ab = {(a+b)/2}² - {(a-b)/2}² = (5/2)² - (3/2)² = 25/4 - 9/4 = 16/4 = 4।"
      },
      {
        id: 10,
        question: "বায়ুমণ্ডলে নাইট্রোজেনের পরিমাণ শতকরা কত ভাগ?",
        subject: "সাধারণ বিজ্ঞান",
        options: ["৭৮.০৯%", "২০.৯৫%", "০.০৩%", "০.৯৩%"],
        ans: 0,
        explanation: "শুষ্ক বায়ুতে নাইট্রোজেনের পরিমাণ প্রায় ৭৮.০৯% এবং অক্সিজেনের পরিমাণ প্রায় ২০.৯৫%।"
      },
      {
        id: 11,
        question: "কম্পিউটারের স্থায়ী স্মৃতিশক্তি কোনটি?",
        subject: "কম্পিউটার ও আইসিটি",
        options: ["RAM", "ROM", "Cache", "Register"],
        ans: 1,
        explanation: "ROM (Read Only Memory) হলো কম্পিউটারের স্থায়ী বা নন-ভোলাটাইল মেমোরি।"
      },
      {
        id: 12,
        question: "বিশ্ব পরিবেশ দিবস পালিত হয় কোন তারিখে?",
        subject: "আন্তর্জাতিক বিষয়াবলি",
        options: ["৫ জুন", "২২ এপ্রিল", "২১ মার্চ", "১ ডিসেম্বর"],
        ans: 0,
        explanation: "প্রতি বছর ৫ জুন সারা বিশ্বে বিশ্ব পরিবেশ দিবস (World Environment Day) পালন করা হয়।"
      },
      {
        id: 13,
        question: "‘গীতাঞ্জলি’ কাব্যের জন্য রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার পান?",
        subject: "বাংলা সাহিত্য",
        options: ["১৯১১", "১৯১৩", "১৯১৪", "১৯১৯"],
        ans: 1,
        explanation: "রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে ‘Song Offerings’ (গীতাঞ্জলি)-এর জন্য সাহিত্যে প্রথম এশীয় হিসেবে নোবেল পুরস্কার লাভ করেন।"
      },
      {
        id: 14,
        question: "‘She is fond ___ reading books.’ শূন্যস্থানে কী বসবে?",
        subject: "English Grammar",
        options: ["with", "of", "in", "to"],
        ans: 1,
        explanation: "Appropriate preposition: 'fond of' অর্থ কোনো কিছুর প্রতি আগ্রহী বা অনুরক্ত।"
      },
      {
        id: 15,
        question: "নিচের কোন নদীটি বাংলাদেশ ও মায়ানমারকে বিভক্ত করেছে?",
        subject: "বাংলাদেশ বিষয়াবলি",
        options: ["নাফ নদী", "কর্ণফুলী নদী", "সাঙ্গু নদী", "হালদা নদী"],
        ans: 0,
        explanation: "নাফ নদী বাংলাদেশ ও মায়ানমার সীমান্ত নির্ধারণকারী নদী। এর দৈর্ঘ্য প্রায় ৫৬ কিমি।"
      }
    ]
  },
  {
    id: "bank-officer-daily",
    title: "কম্বাইন্ড ৮ ব্যাংক অফিসার ডেইলি প্র্যাকটিস টেস্ট",
    category: "bank",
    categoryName: "ব্যাংক জব",
    badge: "Bank",
    badgeColor: "emerald",
    tags: ["Bank", "ব্যাংক", "Bank Officer"],
    durationMinutes: 6, // 10 MCQs = 6 minutes (100 MCQs = 60 min ratio)
    totalMarks: 10,
    negativeMarking: 0.25,
    participants: 9420,
    questionsCount: 10,
    isFree: true,
    scheduledStart: "2026-09-04T00:00:00.000Z",
    scheduledEnd: "2026-09-07T00:00:00.000Z",
    status: "live",
    description: "বাংলাদেশ ব্যাংক এবং সমন্বিত ব্যাংক অফিসার পদের জন্য বিশেষ ইংরেজি, গণিত ও জেনারেল নলেজ প্রশ্ন সেট।",
    questions: [
      {
        id: 1,
        question: "What is the synonym of 'Frugal'?",
        subject: "English",
        options: ["Extravagant", "Economical", "Generous", "Wasteful"],
        ans: 1,
        explanation: "'Frugal' means economical in the use of money or resources (মিতব্যয়ী)।"
      },
      {
        id: 2,
        question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        subject: "Quantitative Aptitude",
        options: ["120 metres", "150 metres", "180 metres", "324 metres"],
        ans: 1,
        explanation: "Speed = 60 × (5/18) = 50/3 m/sec. Distance = Speed × Time = (50/3) × 9 = 150 metres."
      },
      {
        id: 3,
        question: "সেন্ট্রাল ব্যাংক অব বাংলাদেশ কোনটি?",
        subject: "Banking & Economics",
        options: ["সোনালী ব্যাংক", "বাংলাদেশ ব্যাংক", "রূপালী ব্যাংক", "অগ্রণী ব্যাংক"],
        ans: 1,
        explanation: "১৯৭১ সালের ১৬ ডিসেম্বর প্রতিষ্ঠিত বাংলাদেশ ব্যাংক হলো বাংলাদেশের কেন্দ্রীয় ব্যাংক।"
      },
      {
        id: 4,
        question: "The antonym of 'Vague' is-",
        subject: "English",
        options: ["Clear", "Obscure", "Hidden", "Uncertain"],
        ans: 0,
        explanation: "'Vague' অর্থ অস্পষ্ট। এর বিপরীত শব্দ হলো 'Clear' (স্পষ্ট বা পরিচ্ছন্ন)।"
      },
      {
        id: 5,
        question: "If 12 men can finish a piece of work in 20 days, how many days will 15 men take?",
        subject: "Quantitative Aptitude",
        options: ["16 days", "18 days", "14 days", "12 days"],
        ans: 0,
        explanation: "Total work = 12 × 20 = 240 man-days. Time taken by 15 men = 240 / 15 = 16 days."
      }
    ]
  },
  {
    id: "primary-teacher-2026",
    title: "প্রাথমিক সহকারী শিক্ষক নিয়োগ স্পেশাল মডেল টেস্ট - ০৩",
    category: "primary",
    categoryName: "প্রাথমিক",
    badge: "Primary",
    badgeColor: "violet",
    tags: ["Primary", "প্রাথমিক", "Primary Teacher"],
    durationMinutes: 12, // 20 MCQs = 12 minutes (100 MCQs = 60 min ratio)
    totalMarks: 20,
    negativeMarking: 0.25,
    participants: 18350,
    questionsCount: 20,
    isFree: true,
    scheduledStart: "2026-09-04T00:00:00.000Z",
    scheduledEnd: "2026-09-07T00:00:00.000Z",
    status: "live",
    description: "প্রাইমারি নিয়োগ পরীক্ষার অনুরূপ ৮০ নম্বরের প্রস্তুতিমূলক প্রশ্ন থেকে বাছাইকৃত গুরুত্বপূর্ণ সেট।"
  },
  {
    id: "ntrca-19-special",
    title: "১৯তম শিক্ষক নিবন্ধন (NTRCA) স্পেশাল মডেল টেস্ট",
    category: "ntrca",
    categoryName: "শিক্ষক নিবন্ধন",
    badge: "NTRCA",
    badgeColor: "amber",
    tags: ["NTRCA", "নিবন্ধন", "শিক্ষক নিবন্ধন"],
    durationMinutes: 15,
    totalMarks: 25,
    negativeMarking: 0.25,
    participants: 8720,
    questionsCount: 25,
    isFree: true,
    scheduledStart: "2026-09-04T00:00:00.000Z",
    scheduledEnd: "2026-09-07T00:00:00.000Z",
    status: "live",
    description: "১৯তম শিক্ষক নিবন্ধন প্রিলিমিনারি পরীক্ষার সিলেবাস অনুসারে স্কুল ও কলেজ পর্যায়ের পূর্ণাঙ্গ প্রস্তুতি টেস্ট।"
  },
  {
    id: "bcs-47-upcoming-grand",
    title: "৪৭তম বিসিএস প্রিলিমিনারি স্পেশাল লাইভ গ্র্যান্ড মডেল টেস্ট",
    category: "bcs",
    categoryName: "বিসিএস",
    badge: "BCS",
    badgeColor: "rose",
    tags: ["BCS", "বিসিএস", "47th BCS"],
    durationMinutes: 15, // 25 MCQs = 15 minutes (100 MCQs = 60 min ratio)
    totalMarks: 25,
    negativeMarking: 0.5,
    participants: 5200,
    questionsCount: 25,
    isFree: true,
    scheduledStart: "2026-09-06T00:00:00.000Z",
    scheduledEnd: "2026-09-09T00:00:00.000Z",
    status: "upcoming",
    description: "৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষার্থীদের জন্য জাতীয় পর্যায়ের মেধা যাচাই মডেল টেস্ট।"
  },
  {
    id: "math-shortcut-mastery",
    title: "বিসিএস ও ব্যাংক ম্যাথ শর্টকাট স্পেশাল টেস্ট",
    category: "subject",
    categoryName: "গণিত ও আইসিটি",
    badge: "Subject",
    badgeColor: "cyan",
    tags: ["Subject", "Math", "বিষয়ভিত্তিক", "গণিত"],
    durationMinutes: 6, // 10 MCQs = 6 minutes (100 MCQs = 60 min ratio)
    totalMarks: 10,
    negativeMarking: 0.5,
    participants: 11200,
    questionsCount: 10,
    isFree: true,
    scheduledStart: "2026-09-01T00:00:00.000Z",
    scheduledEnd: "2026-09-04T00:00:00.000Z",
    status: "ended",
    description: "ঐকিক নিয়ম, শতকরা, লাভ-ক্ষতি, ধারা ও বীজগণিতের গুরুত্বপূর্ণ বাছাই করা প্রশ্ন।"
  }
];

const getLiveExamDb = async () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {}

  const uri = process.env.MONGODB_URI_LIVE_EXAM;
  const dbName = process.env.MONGODB_DB_NAME_LIVE_EXAM || 'TopMCQBD_DB_Live_Exam';

  if (!uri) {
    throw new Error('MONGODB_URI_LIVE_EXAM environment variable is not defined.');
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 6000,
    serverSelectionTimeoutMS: 6000,
  });
  await client.connect();
  return { client, db: client.db(dbName) };
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Helper to calculate dynamic status from scheduled dates
function getDynamicExamStatus(exam, now = new Date()) {
  if (!exam) return 'live';
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();

  const startTime = exam.scheduledStart ? new Date(exam.scheduledStart).getTime() : null;
  let endTime = exam.scheduledEnd ? new Date(exam.scheduledEnd).getTime() : null;

  // 3 days validity default if end time is missing or not after start
  if (startTime && (!endTime || isNaN(endTime) || endTime <= startTime)) {
    endTime = startTime + (3 * 24 * 60 * 60 * 1000);
  }

  // 1. Before start date -> Upcoming
  if (startTime && !isNaN(startTime) && currentTime < startTime) {
    return 'upcoming';
  }

  // 2. After end date -> Past (ended)
  if (endTime && !isNaN(endTime) && currentTime > endTime) {
    return 'past';
  }

  // 3. During scheduled window -> Live
  return 'live';
}

function formatExamWithDynamicStatus(e) {
  if (!e) return null;
  const dynamicStatus = getDynamicExamStatus(e);
  const qCount = Array.isArray(e.questions) && e.questions.length > 0 ? e.questions.length : (Number(e.questionsCount) || 10);
  const calculatedDuration = Math.max(1, Math.round(qCount * 0.6));
  return {
    ...e,
    id: e.id || e._id?.toString(),
    durationMinutes: calculatedDuration,
    status: dynamicStatus,
    originalStatus: e.status
  };
}

// GET: Fetch all live exams (or single exam by ?id=...)
export async function GET(req) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('id');

    let exams = [];
    try {
      const conn = await getLiveExamDb();
      client = conn.client;
      const db = conn.db;

      if (examId) {
        const single = await db.collection('live_exams').findOne({ $or: [{ id: examId }, { _id: ObjectId.isValid(examId) ? new ObjectId(examId) : null }] });
        if (single) {
          return NextResponse.json({
            success: true,
            exam: formatExamWithDynamicStatus(single)
          }, { headers: CORS_HEADERS });
        }
      }

      exams = await db.collection('live_exams').find({}).sort({ scheduledStart: -1 }).toArray();

      // If live_exams collection is empty in MongoDB, auto-seed the initial exams into MongoDB Atlas!
      if (!exams || exams.length === 0) {
        try {
          const toInsert = DEFAULT_EXAMS.map(e => ({
            ...e,
            questionsCount: Array.isArray(e.questions) ? e.questions.length : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          await db.collection('live_exams').insertMany(toInsert);
          exams = await db.collection('live_exams').find({}).sort({ scheduledStart: -1 }).toArray();
        } catch (seedErr) {
          console.warn("Auto-seed error:", seedErr.message);
          exams = DEFAULT_EXAMS;
        }
      }
    } catch (dbErr) {
      console.warn("DB fetch failed, falling back to cached defaults:", dbErr.message);
      if (!exams || exams.length === 0) {
        exams = DEFAULT_EXAMS;
      }
    }

    if (examId) {
      const found = exams.find(e => e.id === examId);
      if (found) {
        return NextResponse.json({ success: true, exam: formatExamWithDynamicStatus(found) }, { headers: CORS_HEADERS });
      }
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404, headers: CORS_HEADERS });
    }

    return NextResponse.json({
      success: true,
      total: exams.length,
      isLiveMongo: true,
      exams: exams.map(formatExamWithDynamicStatus)
    }, { headers: CORS_HEADERS });

  } catch (err) {
    return NextResponse.json({
      success: true,
      total: DEFAULT_EXAMS.length,
      exams: DEFAULT_EXAMS.map(formatExamWithDynamicStatus),
      isFallback: true
    }, { headers: CORS_HEADERS });
  } finally {
    if (client) {
      try { await client.close(); } catch (e) {}
    }
  }
}

// POST: Create a new live exam or seed default exams
export async function POST(req) {
  let client;
  try {
    const body = await req.json();

    const conn = await getLiveExamDb();
    client = conn.client;
    const db = conn.db;

    const newExam = {
      id: body.id || `live-exam-${Date.now()}`,
      title: body.title || 'নতুন লাইভ মডেল টেস্ট',
      category: body.category || 'bcs',
      categoryName: body.categoryName || 'বিসিএস',
      badge: body.badge || 'লাইভ এক্সাম',
      badgeColor: body.badgeColor || 'rose',
      durationMinutes: Number(body.durationMinutes) || 15,
      totalMarks: Number(body.totalMarks) || 20,
      negativeMarking: Number(body.negativeMarking) || 0.5,
      participants: Number(body.participants) || 0,
      questionsCount: Array.isArray(body.questions) ? body.questions.length : (Number(body.questionsCount) || 0),
      isFree: body.isFree !== false,
      scheduledStart: body.scheduledStart || new Date().toISOString(),
      scheduledEnd: body.scheduledEnd || new Date(Date.now() + 86400000 * 7).toISOString(),
      status: body.status || 'live',
      description: body.description || '',
      questions: Array.isArray(body.questions) ? body.questions : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection('live_exams').insertOne(newExam);

    return NextResponse.json({
      success: true,
      message: 'লাইভ মডেল টেস্ট সফলভাবে তৈরি করা হয়েছে।',
      exam: { ...newExam, _id: result.insertedId.toString() }
    }, { status: 201, headers: CORS_HEADERS });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message || 'পরীক্ষা সংরক্ষণ ব্যর্থ হয়েছে।'
    }, { status: 500, headers: CORS_HEADERS });
  } finally {
    if (client) {
      try { await client.close(); } catch (e) {}
    }
  }
}

// PUT: Update an existing live exam
export async function PUT(req) {
  let client;
  try {
    const body = await req.json();
    const id = body.id || body._id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Exam ID is required.' }, { status: 400, headers: CORS_HEADERS });
    }

    const conn = await getLiveExamDb();
    client = conn.client;
    const db = conn.db;

    const filter = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id }] } : { id };
    
    const updateData = { ...body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const result = await db.collection('live_exams').updateOne(filter, { $set: updateData }, { upsert: true });

    return NextResponse.json({
      success: true,
      message: 'লাইভ মডেল টেস্ট আপডেট করা হয়েছে।',
      updatedId: id
    }, { headers: CORS_HEADERS });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message || 'আপডেট ব্যর্থ হয়েছে।'
    }, { status: 500, headers: CORS_HEADERS });
  } finally {
    if (client) {
      try { await client.close(); } catch (e) {}
    }
  }
}

// DELETE: Delete a live exam
export async function DELETE(req) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id || body._id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required to delete.' }, { status: 400, headers: CORS_HEADERS });
    }

    const conn = await getLiveExamDb();
    client = conn.client;
    const db = conn.db;

    const filter = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id }] } : { id };
    await db.collection('live_exams').deleteOne(filter);

    return NextResponse.json({
      success: true,
      message: 'লাইভ মডেল টেস্ট মুছে ফেলা হয়েছে।'
    }, { headers: CORS_HEADERS });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message || 'মুছে ফেলা সম্ভব হয়নি।'
    }, { status: 500, headers: CORS_HEADERS });
  } finally {
    if (client) {
      try { await client.close(); } catch (e) {}
    }
  }
}
