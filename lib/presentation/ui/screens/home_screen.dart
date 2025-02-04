import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ксения Коваленко — Психоаналитик'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () => context.go('/about'),
              child: const Text('Обо мне'),
            ),
            ElevatedButton(
              onPressed: () => context.go('/services'),
              child: const Text('Услуги'),
            ),
            ElevatedButton(
              onPressed: () => context.go('/testimonials'),
              child: const Text('Отзывы'),
            ),
            ElevatedButton(
              onPressed: () => context.go('/pricing'),
              child: const Text('Стоимость'),
            ),
            ElevatedButton(
              onPressed: () => context.go('/contact'),
              child: const Text('Контакты'),
            ),
          ],
        ),
      ),
    );
  }
}