import fs from "fs"
import { ensureDirExists } from "#src/lib/fileUtils.js"
import {generateRefTexts} from "#src/lib/generateRefTexts.js"
import { agentsInfo, refTextsDir } from "#src/lib/agentsInfo.js"

const audioFiles = Object.values(agentsInfo).map((agent) => agent.audioSamplePathName)

await ensureDirExists(refTextsDir)
generateRefTexts(audioFiles).then((results) => {
  Object.entries(results).forEach(([audioSamplePathName, refText]) => {
    const refTextPathName = Object.values(agentsInfo)
                        .find((agentInfo) => agentInfo.audioSamplePathName === audioSamplePathName)
                        .referenceTextPathName
    
    fs.writeFileSync(refTextPathName, refText.trim(), { encoding: 'utf8'})
  })

  console.log("✅ All refTexts generated succesfuly!")
});
