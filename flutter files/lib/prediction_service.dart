import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

class PredictionService {
  // Replace this with your actual Hugging Face Space URL.
  // Example: https://your-username-resume-matcher-api.hf.space
  static const String baseUrl = 'https://YOUR_USERNAME-resume-matcher-api.hf.space';
  static const Duration _timeout = Duration(seconds: 90);

  static Future<bool> isAlive() async {
    final uri = Uri.parse('$baseUrl/health');
    final response = await http.get(uri).timeout(_timeout);
    return response.statusCode == 200;
  }

  static Future<Map<String, dynamic>> predict({
    required String resumeText,
    required String jobDescription,
  }) async {
    final uri = Uri.parse('$baseUrl/predict');
    final response = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'resume_text': resumeText,
            'job_description': jobDescription,
          }),
        )
        .timeout(_timeout);

    if (response.statusCode != 200) {
      throw Exception('Prediction request failed: ${response.statusCode} ${response.reasonPhrase}');
    }

    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
