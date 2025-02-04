import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../controller/content_provider.dart';

class ServicesScreen extends ConsumerWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contentState = ref.watch(contentProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Услуги'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: contentState.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stackTrace) => Center(child: Text(error.toString())),
          data: (content) => Text(
            content.services,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ),
    );
  }
}
