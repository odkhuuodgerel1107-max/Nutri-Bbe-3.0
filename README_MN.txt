NUTRI BBE 3.0 — APP + OPENAI BACKEND

Энэ архивт:
- www/: Nutri Bbe mobile web app (зураг + текст AI form)
- backend/: OpenAI Responses API proxy server. API key зөвхөн backend-д байна.
- Capacitor config: Android/iOS wrapper төслийг үүсгэхэд ашиглана.
- .github/workflows/: Android debug APK build workflow scaffold.

AI backend setup:
Дэлгэрэнгүйг backend/README_MN.txt-ээс үз.
API key-г апп дотор оруулахгүй. backend/.env файлд хадгална.
OpenAI API төлбөр ChatGPT Plus-аас тусдаа; API account/billing идэвхтэй байх шаардлагатай.

Android:
- Root хавтсанд npm install
- npx cap add android
- npx cap sync android
- npx cap open android
- Android Studio → Build APK.
iOS:
- macOS + Xcode шаардлагатай
- npx cap add ios
- npx cap sync ios
- npx cap open ios
- Xcode signing шаардлагатай.

Энэ орчинд Android SDK, Gradle, Xcode байхгүй тул APK/IPA compile хийгдээгүй. AI бодит дуудлагыг ч хэрэглэгчийн API key болон байршуулсан backend-гүйгээр турших боломжгүй.
