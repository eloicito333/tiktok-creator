import path from "path"
import fs from "fs"
import { __rootdirname } from "#src/dirnames.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";

export const agentsDefaultAction = "at_phone"

export const agentsDir = path.join(__rootdirname, "/resources/agents")

export const agentsInfo = await (async () => {
  const initialObj = {}

  const agentsDirs = fs.readdirSync(agentsDir)
  agentsDirs.forEach(async (agentDir) => {
    const agentPath = path.join(agentsDir, agentDir)
    if (!fs.statSync(agentPath).isDirectory()) return
    const agentName = path.parse(agentDir).name
    initialObj[agentName] = {}

    initialObj[agentName].audioSamplePathName = path.join(agentPath, `audio_sample.mp3`)
    initialObj[agentName].referenceTextPathName = path.join(agentPath, `reference_text.txt`)
    const agentImagesDir = path.join(agentPath, "images")
    await ensureDirExists(agentImagesDir)
    initialObj[agentName].images = {}
    fs.readdirSync(agentImagesDir).forEach((file) => {
      const imagePath = path.join(agentImagesDir, file)
      if(!fs.statSync(imagePath).isFile()) return
      
      const fileName = path.parse(file).name
      initialObj[agentName].images[fileName] = imagePath
    })
    initialObj[agentName].images.default = initialObj[agentName].images[agentsDefaultAction]
  })

  return initialObj;
})();

export const availableAgents = Object.keys(agentsInfo)