export default function checkJava () {
  const CLASSPATH = process.env.CLASSPATH;

  if (!CLASSPATH) {
    throw new ReferenceError(`Environment variable CLASSPATH is not defined;
Java is not installed or is improperly set`);
  }

  // Not matching '~' as it is not understood by Java anyway
  const matchJar = CLASSPATH.match(
    /(.*:)?((\d|\w|\/|-|_|\.)+antlr-\d+\.\d+(\.\d+)?-complete\.jar)(:.*)?/);

  if (matchJar === null) {
    throw new ReferenceError(`Cannot find ANTLR4 .jar file;
It should appear in your CLASSPATH`);
  }
}
