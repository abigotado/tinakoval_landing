import 'package:tinakoval_landing/data/datasource/content_local_service.dart';

import '../../domain/models/content_model.dart';
import '../../domain/repository/content_repository.dart';

class ContentRepositoryImpl implements ContentRepository {
  ContentRepositoryImpl(this._contentLocalService);

  final ContentLocalService _contentLocalService;

  @override
  Future<Content> fetchContent() {
    return Future.value(_contentLocalService.fetchContent());
  }
}
