const { withProjectBuildGradle, withGradleProperties, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin that applies Android build fixes:
 * 1. Adds async-storage local_repo as Maven repository
 * 2. Increases JVM memory for large React Native builds
 * 3. Adds Node.js to PATH in gradlew.bat for Windows cmd /c compatibility
 */
function withAndroidBuildFixes(config) {
  // 1. Add async-storage local Maven repo to build.gradle
  config = withProjectBuildGradle(config, (config) => {
    const localRepoLine =
      '    maven {\n      url "$rootDir/../node_modules/@react-native-async-storage/async-storage/android/local_repo"\n    }';
    if (!config.modResults.contents.includes('async-storage')) {
      config.modResults.contents = config.modResults.contents.replace(
        "maven { url 'https://www.jitpack.io' }",
        `maven { url 'https://www.jitpack.io' }\n${localRepoLine}`
      );
    }
    return config;
  });

  // 2. Increase JVM memory
  config = withGradleProperties(config, (config) => {
    const props = config.modResults;
    const jvmArgsIndex = props.findIndex(
      (p) => p.type === 'property' && p.key === 'org.gradle.jvmargs'
    );
    if (jvmArgsIndex >= 0) {
      props[jvmArgsIndex].value = '-Xmx4096m -XX:MaxMetaspaceSize=1024m';
    }
    return config;
  });

  // 3. Add Node.js to PATH in gradlew.bat for Windows
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const gradlewPath = path.join(config.modRequest.platformProjectRoot, 'gradlew.bat');
      if (fs.existsSync(gradlewPath)) {
        let contents = fs.readFileSync(gradlewPath, 'utf8');
        const nodeFix =
          '\r\n@rem Ensure Node.js is on PATH for React Native / Expo build plugins\r\nif exist "C:\\Program Files\\nodejs\\node.exe" set "PATH=C:\\Program Files\\nodejs;%PATH%"\r\n';
        if (!contents.includes('Ensure Node.js is on PATH')) {
          contents = contents.replace(
            'set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"',
            `set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"${nodeFix}`
          );
          fs.writeFileSync(gradlewPath, contents);
        }
      }
      return config;
    },
  ]);

  return config;
}

module.exports = withAndroidBuildFixes;
