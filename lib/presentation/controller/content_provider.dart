import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../data/providers/data_providers.dart';
import '../../domain/models/content_model.dart';

part 'content_provider.g.dart';

@riverpod
Future<Content> content(Ref ref) => ref.watch(contentRepositoryProvider).fetchContent();
