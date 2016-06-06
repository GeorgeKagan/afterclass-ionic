jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms\android\build\outputs\apk\android-armv7-release-unsigned.apk afterclass

zipalign -v 4 platforms\android\build\outputs\apk\android-armv7-release-unsigned.apk AfterClass.apk