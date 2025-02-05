import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:tinakoval_landing/domain/repository/content_repository.dart';

import '../datasource/content_local_service.dart';
import '../repository/content_repository_impl.dart';

part 'data_providers.g.dart';

@riverpod
ContentLocalService contentLocalService(Ref ref) => ContentLocalService();

@riverpod
ContentRepository contentRepository(Ref ref) {
  return ContentRepositoryImpl(ref.watch(contentLocalServiceProvider));
}
