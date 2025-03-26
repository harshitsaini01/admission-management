import Center from "../models/Center"; // Adjusted path

export const generateUniqueCode = async (): Promise<string> => {
  const existingCodes = await Center.find().distinct("code");
  let newCode: string;
  do {
    newCode = Math.floor(1000 + Math.random() * 9000).toString();
  } while (existingCodes.includes(newCode));
  return newCode;
};