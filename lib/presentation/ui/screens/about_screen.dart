import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tinakoval_landing/presentation/controller/content_provider.dart';

class AboutScreen extends ConsumerWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contentState = ref.watch(contentProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Обо мне'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: contentState.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stackTrace) => Center(child: Text(error.toString())),
          data: (content) => Text(
            content.about,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
