# React Bits audit and landing navigation

References audited: https://reactbits.dev/text-animations/blur-text and https://reactbits.dev/animations/magnet, including their linked source patterns.

Selected restrained word-by-word blur reveal for the hero introduction and a spring magnetic hero CTA. Both are independent local implementations using the existing Motion package; React Bits source components were not installed or copied. Existing spotlight cards, image parallax and masked title reveals remain. No additional dependencies or heavy background effects.

Header About, Ecosystem, Journals and Contact now target homepage sections. Explore Journals retains the dedicated catalog route. The header stays visible. Navigation animates scroll with a measured header offset, then focuses and animates the destination heading. Cross-route links return to the homepage; repeating the active header link replays arrival. Wheel, touch and scroll keys cancel programmatic movement. Reduced motion uses immediate positioning without heading animation. Modified clicks keep native link behavior.

Implementation: src/components/effects.jsx, src/App.jsx, src/styles.css. Regression tests in src/App.test.jsx and scripts/check-section-navigation.js. Existing catalog navigation QA updated to click the dedicated CTA.

Verification: eight Vitest tests passed; production build passed. Production browser checks passed for all four header destinations, cross-route navigation, repeated active-link arrival, mobile drawer closure, magnetic CTA transform, reduced-motion immediate navigation and zero arrival animation. Five homepage widths (360/390/768/1024/1440) and ten detail routes passed existing QA with no overflow or broken images. Frame sampling verified the intro blur resolves to zero. Production ZIP rebuilt and integrity checked. Preview: http://127.0.0.1:5180/.
