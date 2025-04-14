import path from "path"
import { __rootdirname } from "#src/dirnames.js";
import { ensureDirExists } from "./lib/fileUtils.js";

export const agentsDir = path.join(__rootdirname, "/resources/agents")

export const agentsInfo = (() => {
  const initialObj = {}

  const agentsDirs = fs.readdirSync(agentsDir)
  agentsDirs.forEach((agentDir) => {
    const agentPath = path.join(agentsDir, agentDir)
    if (!fs.statSync(agentPath).isDirectory()) return
    const agentName = path.parse(agentDir).name
    initialObj[agentName] = {}

    initialObj[agentName].audioSamplePathName = path.join(agentPath, `audio_sample.mp3`)
    initialObj[agentName].referenceTextPathName = path.join(agentPath, `reference_text.txt`)
    const agentImagesDir = path.join(agentPath, "images")
    ensureDirExists(agentImagesDir)
    initialObj[agentName].images = {}
    fs.readdirSync(agentImagesDir).forEach((file) => {
      const imagePath = path.join(agentImagesDir, file)
      if(!fs.statSync(imagePath).isFile()) return
      
      const fileName = path.parse(file).name
      initialObj[agentName].images[fileName] = imagePath
    })
  })

  return initialObj;
})();

export const availableAgents = Object.keys(agentsInfo)