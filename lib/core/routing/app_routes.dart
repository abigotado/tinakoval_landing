import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../presentation/ui/screens/about_screen.dart';
import '../../presentation/ui/screens/contact_screen.dart';
import '../../presentation/ui/screens/home_screen.dart';
import '../../presentation/ui/screens/pricing_screen.dart';
import '../../presentation/ui/screens/services_screen.dart';
import '../../presentation/ui/screens/testimonials_screen.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/about',
        builder: (context, state) => const AboutScreen(),
      ),
      GoRoute(
        path: '/services',
        builder: (context, state) => const ServicesScreen(),
      ),
      GoRoute(
        path: '/testimonials',
        builder: (context, state) => const TestimonialsScreen(),
      ),
      GoRoute(
        path: '/pricing',
        builder: (context, state) => const PricingScreen(),
      ),
      GoRoute(
        path: '/contact',
        builder: (context, state) => const ContactScreen(),
      ),
    ],
  );
});
