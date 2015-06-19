jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore C:\phonegap\AfterClass-Ionic\platforms\android\build\outputs\apk\android-x86-release-unsigned.apk alias_name

zipalign -v 4 C:\phonegap\AfterClass-Ionic\platforms\android\build\outputs\apk\android-x86-release-unsigned.apk AfterClass.apk