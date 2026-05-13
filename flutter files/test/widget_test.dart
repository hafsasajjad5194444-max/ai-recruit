import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ai_resume_shortlisting/main.dart';

void main() {
  testWidgets('App starts and shows title', (WidgetTester tester) async {
    await tester.pumpWidget(const AIRecruitApp());

    expect(find.text('AI Recruit'), findsOneWidget);
    expect(find.byType(FloatingActionButton), findsOneWidget);
  });
}
