import '../models/content_model.dart';

abstract interface class ContentRepository {
  Future<Content> fetchContent();
}
