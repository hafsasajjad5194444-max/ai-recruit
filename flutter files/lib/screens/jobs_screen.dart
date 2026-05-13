import 'package:flutter/material.dart';

import '../services/database_helper.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  List<Map<String, dynamic>> _jobs = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final jobs = await DatabaseHelper.getAllJobs();
      if (mounted) {
        setState(() {
          _jobs = jobs;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  String formatSalary(dynamic min, dynamic max) {
    final minText = min != null ? min.toString() : '0';
    final maxText = max != null ? max.toString() : '0';
    return '₨$minText - ₨$maxText';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs from MySQL'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadJobs,
            tooltip: 'Reload jobs',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
                        const SizedBox(height: 16),
                        const Text('Unable to load jobs from MySQL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadJobs,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _jobs.isEmpty
                    ? const Center(child: Text('No jobs found in the database.'))
                    : ListView.separated(
                        itemCount: _jobs.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final job = _jobs[index];
                          return ListTile(
                            title: Text(job['title']?.toString() ?? 'Unknown job'),
                            subtitle: Text('${job['company'] ?? ''} • ${job['location'] ?? ''}'),
                            trailing: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(formatSalary(job['salary_min'], job['salary_max'])),
                                const SizedBox(height: 4),
                                Text(job['job_type']?.toString() ?? '', style: const TextStyle(fontSize: 12)),
                              ],
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
