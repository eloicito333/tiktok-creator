import path from "path"
import { __rootdirname } from "#src/dirnames.js";

export const audioSamplesDir = path.join(__rootdirname, "/resources/agent_audio_samples")
export const refTextsDir = path.join(__rootdirname, "/resources/agent_reference_texts")

export const agentsInfo = (() => {
  const initialObj = {
    "carles_puigdemont": {},
    "pere_aragones": {},
    "pedro_sanchez": {},
    "mariano_rajoy": {},
    "pablo_iglesias": {},
    "santiago_abascal": {},
    "francisco_franco": {},
  }

  for (const agent in initialObj) {
    initialObj[agent].audioSamplePathName = path.join(audioSamplesDir, `${agent}_audio_sample.mp3`)
    initialObj[agent].referenceTextPathName = path.join(refTextsDir, `${agent}_reference_text.txt`)
  }

  return initialObj;
})();

export const availableAgents = Object.keys(agentsInfo)