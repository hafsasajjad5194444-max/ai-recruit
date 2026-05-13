import 'package:mysql1/mysql1.dart';

class DatabaseHelper {
  static MySqlConnection? _conn;

  // ── Connection settings ───────────────────────────────────────────────────
  static final _settings = ConnectionSettings(
    host: 'localhost',
    port: 3306,
    db: 'airecruit',
    user: 'airecruit_user',
    password: 'airecruit_pass',
  );

  // ── Get or open connection ───────────────────────────────────────────────
  static Future<MySqlConnection> get connection async {
    _conn ??= await MySqlConnection.connect(_settings);
    return _conn!;
  }

  // ── Get all active jobs ──────────────────────────────────────────────────
  static Future<List<Map<String, dynamic>>> getAllJobs() async {
    final db = await connection;
    final results = await db.query('''
      SELECT j.id, j.title, j.salary_min, j.salary_max,
             j.deadline, j.is_active,
             c.name AS company,
             cat.name AS category,
             loc.city AS location,
             jt.name AS job_type
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN categories cat ON j.category_id = cat.id
      JOIN locations loc ON j.location_id = loc.id
      JOIN job_types jt ON j.type_id = jt.id
      WHERE j.is_active = 1
      ORDER BY j.created_at DESC
    ''');
    return results.map((row) => row.fields).toList();
  }

  // ── Filter jobs by category ──────────────────────────────────────────────
  static Future<List<Map<String, dynamic>>> getJobsByCategory(int categoryId) async {
    final db = await connection;
    final results = await db.query(
      '''
      SELECT j.*
      FROM jobs j
      WHERE j.category_id = ? AND j.is_active = 1
      ''',
      [categoryId],
    );
    return results.map((row) => row.fields).toList();
  }

  // ── Submit a job application ─────────────────────────────────────────────
  static Future<void> applyForJob(int jobId, int candidateId) async {
    final db = await connection;
    await db.query(
      '''
      INSERT IGNORE INTO applications
        (job_id, candidate_id, status)
      VALUES (?, ?, 'Pending')
      ''',
      [jobId, candidateId],
    );
  }

  // ── Bookmark a job ───────────────────────────────────────────────────────
  static Future<void> bookmarkJob(int jobId, int candidateId) async {
    final db = await connection;
    await db.query(
      '''
      INSERT IGNORE INTO bookmarks (job_id, candidate_id)
      VALUES (?, ?)
      ''',
      [jobId, candidateId],
    );
  }

  // ── Get all applications for a candidate ─────────────────────────────────
  static Future<List<Map<String, dynamic>>> getCandidateApplications(int candidateId) async {
    final db = await connection;
    final results = await db.query(
      '''
      SELECT j.title, c.name AS company, a.status, a.applied_at
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
      ''',
      [candidateId],
    );
    return results.map((row) => row.fields).toList();
  }

  // ── Close connection when app closes ─────────────────────────────────────
  static Future<void> close() async {
    await _conn?.close();
    _conn = null;
  }
}
