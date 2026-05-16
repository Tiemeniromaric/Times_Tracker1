const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const {
  registerSchema,
  loginSchema,
  projectSchema,
  timeEntrySchema,
} = require("./models");

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded media statically
app.use("/uploads", express.static(uploadDir));

// Multer storage for media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Accept only image/video files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ];

  const okMime = allowedMimeTypes.includes(file.mimetype);
  const okExt = /jpeg|jpg|png|gif|mp4|mov/i.test(
    path.extname(file.originalname),
  );

  if (okMime && okExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files (jpg, png, gif) and video files (mp4, mov) are allowed",
      ),
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

// Public media upload endpoint
app.post("/upload", (req, res) => {
  upload.single("media")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File too large. Max size is 50MB." });
      }
      return res.status(400).json({ error: err.message });
    }

    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  });
});

// Media list route
app.get("/uploads-list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read uploads folder" });
    }

    const media = files
      .filter((file) => /\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(file))
      .map((file) => ({
        name: file,
        url: `/uploads/${file}`,
        ext: path.extname(file).toLowerCase(),
      }));

    res.json(media);
  });
});

// Delete uploaded media route
app.delete("/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        return res.status(500).json({ error: "Failed to delete file" });
      }

      res.json({ message: "File deleted successfully" });
    });
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later.",
});
app.use("/register", authLimiter);
app.use("/login", authLimiter);

let db;

const setupDb = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true,
});

const schema = fs.readFileSync("../database/schema.sql", "utf8");

setupDb.query(schema, (err) => {
  if (err) {
    console.error("Database setup error:", err);
    process.exit(1);
  }
  console.log("Database setup complete");
  setupDb.end();

  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  });
});

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ error: "Access denied" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader;

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
};

// Register
app.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    (err) => {
      if (err) return res.status(400).json({ error: "User already exists" });
      res.json({ message: "User registered successfully" });
    },
  );
});

// Login
app.post("/login", (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Database error during login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        console.log(`Login failed: email ${email} not found`);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, results[0].password);
      if (!valid) {
        console.log(`Login failed: invalid password for ${email}`);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: results[0].id, role: results[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      console.log(`Login successful for ${email}`);
      res.json({ token, role: results[0].role });
    },
  );
});

// Admin-only route example
app.get("/admin/users", authenticate, requireAdmin, (req, res) => {
  db.query("SELECT id, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Projects routes
app.post("/projects", authenticate, (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name } = req.body;
  db.query(
    "INSERT INTO projects (user_id, name) VALUES (?, ?)",
    [req.user.id, name],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to add project" });
      res.json({ message: "Project added" });
    },
  );
});

app.get("/projects", authenticate, (req, res) => {
  db.query(
    "SELECT * FROM projects WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch projects" });
      }
      res.json(results);
    },
  );
});

app.put("/projects/:id", authenticate, (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name } = req.body;
  db.query(
    "UPDATE projects SET name = ? WHERE id = ? AND user_id = ?",
    [name, req.params.id, req.user.id],
    (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to update project" });
      res.json({ message: "Project updated" });
    },
  );
});

app.delete("/projects/:id", authenticate, (req, res) => {
  db.query(
    "DELETE FROM time_entries WHERE project_id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to delete associated time entries" });
      }

      db.query(
        "DELETE FROM projects WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id],
        (err) => {
          if (err)
            return res.status(500).json({ error: "Failed to delete project" });
          res.json({ message: "Project deleted" });
        },
      );
    },
  );
});

// Time entries
app.post("/time", authenticate, (req, res) => {
  const { error } = timeEntrySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { project_id, start_time, end_time, duration, notes } = req.body;

  const formatForMySQL = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace("T", " ");
  };

  const mysqlStart = formatForMySQL(start_time);
  const mysqlEnd = formatForMySQL(end_time);

  if (!mysqlStart || !mysqlEnd) {
    return res.status(400).json({ error: "Invalid start or end time" });
  }

  db.query(
    `INSERT INTO time_entries (user_id, project_id, start_time, end_time, duration, notes)
VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      Number(project_id),
      mysqlStart,
      mysqlEnd,
      duration,
      notes || null,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log time" });
      }
      res.json({ message: "Time logged" });
    },
  );
});

app.get("/time", authenticate, (req, res) => {
  const { project_id, date } = req.query;
  let query =
    "SELECT te.*, p.name AS project_name FROM time_entries te JOIN projects p ON te.project_id = p.id WHERE te.user_id = ?";
  const params = [req.user.id];

  if (project_id) {
    query += " AND te.project_id = ?";
    params.push(project_id);
  }
  if (date) {
    query += " AND DATE(te.start_time) = ?";
    params.push(date);
  }

  db.query(query, params, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Failed to fetch time entries" });
    res.json(results);
  });
});
