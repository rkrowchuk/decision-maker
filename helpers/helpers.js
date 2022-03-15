function generateRandomString() {
  const result = Math.random().toString(36).substring(2,7);
  return result;
}
module.exports = { generateRandomString };
