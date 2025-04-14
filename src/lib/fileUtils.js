import fs from 'fs';

export const ensureDirExists = (folderName) => {
  try {
    fs.mkdirSync(folderName, { recursive: true });
  } catch (err) {
    // If the error is not related to the directory already existing, throw it
    if (err.code !== 'EEXIST') {
      throw new Error(`Error creating directory "${folderName}":`, err);
    }
    // Otherwise, do nothing
  }
};
