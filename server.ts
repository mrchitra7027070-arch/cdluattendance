import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import dns from "dns";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
let useLocalStore = true;

app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

// --- Mongoose Configuration ---
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    (ret as any).id = ret._id.toString();
    return ret;
  }
});
mongoose.set('toObject', { virtuals: true });

// --- MongoDB Schemas ---
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["teacher", "student"], required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  phone: { type: String },
  rollNumber: { type: String, unique: true, sparse: true },
  className: { type: String },
  section: { type: String },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  semester: { type: String },
  year: { type: String },
  section: { type: String },
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

const sessionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  roomNo: { type: String },
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ["P", "A", "L"], required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
const Session = mongoose.model("Session", sessionSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// --- Local JSON fallback database ---
type LocalUser = {
  id: string;
  role: "teacher" | "student";
  name: string;
  email?: string;
  password: string;
  username?: string;
  phone?: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
};

type LocalCourse = {
  id: string;
  teacherId: string;
  name: string;
  semester?: string;
  year?: string;
  section?: string;
  createdAt: string;
  updatedAt: string;
};

type LocalEnrollment = {
  id: string;
  courseId: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
};

type LocalSession = {
  id: string;
  courseId: string;
  teacherId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  roomNo?: string;
  createdAt: string;
  updatedAt: string;
};

type LocalAttendance = {
  id: string;
  sessionId: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "P" | "A" | "L";
  createdAt: string;
  updatedAt: string;
};

type LocalDb = {
  users: LocalUser[];
  courses: LocalCourse[];
  enrollments: LocalEnrollment[];
  sessions: LocalSession[];
  attendance: LocalAttendance[];
};

const localDbPath = path.join(__dirname, ".local-data", "db.json");

const emptyLocalDb = (): LocalDb => ({
  users: [],
  courses: [],
  enrollments: [],
  sessions: [],
  attendance: [],
});

async function readLocalDb(): Promise<LocalDb> {
  try {
    const raw = await fs.readFile(localDbPath, "utf8");
    return { ...emptyLocalDb(), ...JSON.parse(raw) };
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
    return emptyLocalDb();
  }
}

async function writeLocalDb(db: LocalDb) {
  await fs.mkdir(path.dirname(localDbPath), { recursive: true });
  await fs.writeFile(localDbPath, JSON.stringify(db, null, 2));
}

function stamp<T extends Record<string, any>>(item: T): T & { id: string; createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();
  return { ...item, id: randomUUID(), createdAt: now, updatedAt: now };
}

function matchesQuery<T extends Record<string, any>>(item: T, query: Record<string, any>) {
  return Object.entries(query).every(([key, value]) => item[key] === value);
}

function getDuplicateField(existing: LocalUser, data: Partial<LocalUser>) {
  if (data.email && existing.email === data.email) return "Email";
  if (data.username && existing.username === data.username) return "Username";
  if (data.rollNumber && existing.rollNumber === data.rollNumber) return "Roll Number";
  return "identifier";
}

// --- API Routes ---
app.get("/api/users/roll/:rollNumber", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const user = db.users.find(u => u.rollNumber === req.params.rollNumber && u.role === "student");
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    }

    const user = await User.findOne({ rollNumber: req.params.rollNumber, role: "student" });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (useLocalStore) {
      const db = await readLocalDb();
      const user = db.users.find(u => {
        if (u.role !== role) return false;
        if (role === "teacher") {
          return u.email === identifier || u.username === identifier || u.phone === identifier;
        }
        return u.rollNumber === identifier || u.email === identifier;
      });

      if (user && user.password === password) return res.json(user);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let user;
    if (role === 'teacher') {
      user = await User.findOne({ 
        role: 'teacher',
        $or: [{ email: identifier }, { username: identifier }, { phone: identifier }]
      });
    } else {
      user = await User.findOne({ 
        role: 'student',
        $or: [{ rollNumber: identifier }, { email: identifier }]
      });
    }

    if (user && user.password === password) { // In production use bcrypt
      const userObj = user.toObject();
      res.json(userObj);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, rollNumber } = req.body;
    if (useLocalStore) {
      const db = await readLocalDb();
      const existing = db.users.find(user =>
        (email && user.email === email) ||
        (username && user.username === username) ||
        (rollNumber && user.rollNumber === rollNumber)
      );

      if (existing) {
        return res.status(400).json({ error: `${getDuplicateField(existing, req.body)} already exists.` });
      }

      const user = stamp(req.body);
      db.users.push(user);
      await writeLocalDb(db);
      return res.status(201).json(user);
    }

    const filter: any[] = [];
    if (email) filter.push({ email });
    if (username) filter.push({ username });
    if (rollNumber) filter.push({ rollNumber });

    if (filter.length > 0) {
      const existing = await User.findOne({ $or: filter });
      if (existing) {
        let duplicateField = "identifier";
        if (email && existing.email === email) duplicateField = "Email";
        else if (username && existing.username === username) duplicateField = "Username";
        else if (rollNumber && existing.rollNumber === rollNumber) duplicateField = "Roll Number";
        return res.status(400).json({ error: `${duplicateField} already exists.` });
      }
    }

    const user = new User(req.body);
    await user.save();
    const userObj = user.toObject();
    res.status(201).json(userObj);
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(400).json({ error: err.message || "Failed to register user" });
  }
});

// Courses
app.get("/api/courses", async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;
    if (useLocalStore) {
      const db = await readLocalDb();
      if (teacherId) {
        return res.json(db.courses.filter(course => course.teacherId === teacherId));
      }
      if (studentId) {
        const courseIds = db.enrollments
          .filter(enrollment => enrollment.studentId === studentId)
          .map(enrollment => enrollment.courseId);
        return res.json(db.courses.filter(course => courseIds.includes(course.id)));
      }
      return res.json(db.courses);
    }

    if (teacherId) {
      const courses = await Course.find({ teacherId: teacherId as string });
      res.json(courses);
    } else if (studentId) {
      const enrollments = await Enrollment.find({ studentId: studentId as string }).populate('courseId');
      res.json(enrollments.map(e => e.courseId));
    } else {
      const courses = await Course.find();
      res.json(courses);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const course = stamp(req.body);
      db.courses.push(course);
      await writeLocalDb(db);
      return res.status(201).json(course);
    }

    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/courses/:courseId", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const course = db.courses.find(c => c.id === req.params.courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });
      Object.assign(course, req.body, { updatedAt: new Date().toISOString() });
      await writeLocalDb(db);
      return res.json(course);
    }

    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Students & Enrollments
app.get("/api/courses/:courseId/students", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const studentIds = db.enrollments
        .filter(enrollment => enrollment.courseId === req.params.courseId)
        .map(enrollment => enrollment.studentId);
      return res.json(db.users.filter(user => studentIds.includes(user.id)));
    }

    const enrollments = await Enrollment.find({ courseId: req.params.courseId }).populate('studentId');
    res.json(enrollments.map(e => e.studentId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/enrollments", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const exists = db.enrollments.find(enrollment =>
        enrollment.courseId === req.body.courseId && enrollment.studentId === req.body.studentId
      );
      if (exists) return res.status(400).json({ error: "Student is already enrolled in this course." });

      const enrollment = stamp(req.body);
      db.enrollments.push(enrollment);
      await writeLocalDb(db);
      return res.status(201).json(enrollment);
    }

    const enrollment = new Enrollment(req.body);
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/enrollments", async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    if (useLocalStore) {
      const db = await readLocalDb();
      db.enrollments = db.enrollments.filter(enrollment =>
        !(enrollment.courseId === courseId && enrollment.studentId === studentId)
      );
      await writeLocalDb(db);
      return res.json({ success: true });
    }

    await Enrollment.deleteOne({ courseId: courseId as string, studentId: studentId as string });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:userId", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      const user = db.users.find(u => u.id === req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      Object.assign(user, req.body, { updatedAt: new Date().toISOString() });
      await writeLocalDb(db);
      return res.json(user);
    }

    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userObj = user.toObject();
    res.json(userObj);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/courses/:courseId", async (req, res) => {
  try {
    if (useLocalStore) {
      const db = await readLocalDb();
      db.courses = db.courses.filter(course => course.id !== req.params.courseId);
      db.enrollments = db.enrollments.filter(enrollment => enrollment.courseId !== req.params.courseId);
      db.sessions = db.sessions.filter(session => session.courseId !== req.params.courseId);
      db.attendance = db.attendance.filter(record => record.courseId !== req.params.courseId);
      await writeLocalDb(db);
      return res.json({ success: true });
    }

    await Course.findByIdAndDelete(req.params.courseId);
    // Associated data (enrollments, sessions, attendance) should also be cleaned up in a real app
    await Enrollment.deleteMany({ courseId: req.params.courseId });
    await Session.deleteMany({ courseId: req.params.courseId });
    await Attendance.deleteMany({ courseId: req.params.courseId });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance
app.get("/api/attendance", async (req, res) => {
  try {
    const { studentId, courseId, sessionId, date } = req.query;
    const query: any = {};
    if (studentId) query.studentId = studentId;
    if (courseId) query.courseId = courseId;
    if (sessionId) query.sessionId = sessionId;
    if (date) query.date = date;

    if (useLocalStore) {
      const db = await readLocalDb();
      const records = db.attendance
        .filter(record => matchesQuery(record, query))
        .sort((a, b) => b.date.localeCompare(a.date));
      return res.json(records);
    }
    
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance/mark", async (req, res) => {
  try {
    const { courseId, teacherId, date, studentStatus, metadata, allowUpdate } = req.body;

    if (useLocalStore) {
      const db = await readLocalDb();
      const now = new Date().toISOString();
      let session = db.sessions.find(s => s.courseId === courseId && s.date === date);
      if (!session) {
        session = stamp({ courseId, teacherId, date, ...(metadata || {}) });
        db.sessions.push(session);
      } else if (!allowUpdate) {
        return res.status(409).json({ error: "Attendance Already Exists, Update Record?" });
      } else if (metadata) {
        Object.assign(session, metadata, { updatedAt: now });
      }

      for (const item of studentStatus) {
        const record = db.attendance.find(a => a.sessionId === session!.id && a.studentId === item.studentId);
        if (record) {
          Object.assign(record, { status: item.status, courseId, date, updatedAt: now });
        } else {
          db.attendance.push(stamp({
            sessionId: session.id,
            studentId: item.studentId,
            courseId,
            date,
            status: item.status,
          }));
        }
      }

      await writeLocalDb(db);
      return res.json({ success: true });
    }
    
    let session = await Session.findOne({ courseId, date });
    if (!session) {
      session = new Session({ courseId, teacherId, date, ...metadata });
      await session.save();
    } else if (!allowUpdate) {
      return res.status(409).json({ error: "Attendance Already Exists, Update Record?" });
    } else if (metadata) {
      await Session.findByIdAndUpdate(session._id, metadata);
    }

    const updates = studentStatus.map((item: any) => ({
      updateOne: {
        filter: { sessionId: session!._id, studentId: item.studentId },
        update: { $set: { status: item.status, courseId, date } },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(updates);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Vite & Production Setup ---
async function start() {
  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Fail faster locally
      });
      useLocalStore = false;
      console.log("Connected to MongoDB successfully!");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      console.error("Please ensure your IP is whitelisted in MongoDB Atlas and the URI is correct.");
      console.warn(`MongoDB unavailable. Using local JSON storage at ${localDbPath}`);
    }
  } else {
    console.warn("=================================================");
    console.warn("CRITICAL: MONGODB_URI not found in .env file.");
    console.warn("To fix this locally:");
    console.warn("1. Create a file named .env in the project root.");
    console.warn("2. Add the following to your .env file:");
    console.warn("MONGODB_URI=your_mongodb_connection_string");
    console.warn("\nTip: If you see 'querySrv ECONNREFUSED', it means your DNS blocks SRV records.");
    console.warn("Go to Atlas -> Connect -> Drivers -> Node.js -> Version '2.2.12 or later'.");
    console.warn("Use the 'Standard Connection String' (mongodb://... instead of mongodb+srv://).");
    console.warn("3. Restart the server.");
    console.warn("=================================================");
    console.warn(`Using local JSON storage at ${localDbPath}`);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");
    app.use(express.static(distPath));

    app.get("/", (req, res) => {
      res.sendFile(indexPath);
    });

    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
