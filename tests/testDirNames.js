import { __rootdirname } from "#src/dirnames.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";
import path from "path"

export const testsDirName = path.join(__rootdirname, "/tests");
export const testsGenDirName = path.join(__rootdirname, "/tests/tests-gen");

ensureDirExists(testsGenDirName)