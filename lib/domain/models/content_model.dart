import 'package:freezed_annotation/freezed_annotation.dart';

part 'content_model.freezed.dart';
part 'content_model.g.dart';

@freezed
class Content with _$Content {
  const factory Content({
    required String about,
    required String services,
    required String testimonials,
    required String pricing,
    required String contact,
  }) = _Content;

  factory Content.fromJson(Map<String, dynamic> json) => _$ContentFromJson(json);
}
