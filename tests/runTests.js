import fs from "fs"
import { fileURLToPath } from "url"
import path from "path"
import { testsDirName } from "./testDirNames.js"

// Get the current file name dynamically
const currentFile = path.basename(fileURLToPath(import.meta.url))

// Get the test name from the command-line arguments
const args = process.argv.slice(2) // Get arguments after `npm run test`
const testName = args[0] // First argument is the test name
const runAllTests = async () => {
  const files = fs.readdirSync(testsDirName)
  for (const file of files) {
    const fullFilePath = path.join(testsDirName, file)
    if (
      !fs.statSync(fullFilePath).isFile() ||
      !file.endsWith(".test.js") ||
      file === currentFile
    )
      continue

    const testName = file.replace(/\.test\.js$/, "")
    console.log(`⏳ Running test: ${testName}...`)
    await import(fullFilePath)
      .then(() => {
        console.log(`✅ ${testName} test run successfully`)
      })
      .catch(err => {
        console.error(`❌ ${testName} test failed:`, err)
      })
  }
}

const runSingleTest = async (testName) => {
  const testFile = `./${testName}.test.js`

  if (testFile === currentFile) {
    console.log(`⏩ Skipping the current file: ${currentFile}`)
    return
  }
  console.log(`⏳ Running test: ${testName}...`)
  await import(testFile)
    .then(() => {
      console.log(`✅ ${testName} test run successfully`)
    })
    .catch(err => {
      console.error(`❌ ${testName} test failed:`, err)
    })
}

if (!testName) {
  console.log("No test name provided. Running all tests...")
  await runAllTests()
} else {
  await runSingleTest(testName)
}