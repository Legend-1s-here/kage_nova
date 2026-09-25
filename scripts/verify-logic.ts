import { hashKey, verifyKey, createGroupToken, verifyGroupToken } from "../lib/auth";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "../lib/rate-limit";
import { slugify, validateGroupCreation, validateLabCodeUpload, MAX_CODE_BYTES } from "../lib/validation";

async function runTests() {
  console.log("=========================================");
  console.log("   KAGENOVA Automated Test Suite         ");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Slugify test
  console.log("--- Test Group: Slugification ---");
  assert(slugify("CS301 - Batch A") === "cs301-batch-a", "Converts name with spaces and hyphen to valid slug");
  assert(slugify("Data Structures & Algorithms #1!") === "data-structures-algorithms-1", "Strips special characters");
  assert(slugify("   trimmed-slug   ") === "trimmed-slug", "Trims leading and trailing spaces");

  // 2. Auth: bcrypt hashing and comparison
  console.log("\n--- Test Group: Auth & Password Hashing ---");
  const testPassword = "secretPassword123";
  const hash = await hashKey(testPassword);
  assert(hash.startsWith("$2"), "Password hash starts with bcrypt signature");
  assert(await verifyKey(testPassword, hash) === true, "Valid password matches hash");
  assert(await verifyKey("wrongPassword", hash) === false, "Invalid password fails match");

  // 3. Auth: Scoped JWT tokens
  console.log("\n--- Test Group: Scoped JWT Session Tokens ---");
  const token = createGroupToken("cs301-batch-a");
  assert(typeof token === "string" && token.length > 20, "Generates valid JWT string");
  assert(verifyGroupToken(token, "cs301-batch-a") === true, "Token valid for matching slug");
  assert(verifyGroupToken(token, "CS301-BATCH-A") === true, "Token verification is case-insensitive");
  assert(verifyGroupToken(token, "other-group-slug") === false, "Token rejected for different group slug");
  assert(verifyGroupToken("invalid.token.string", "cs301-batch-a") === false, "Corrupted token rejected");

  // 4. Rate Limiter: Sliding Window
  console.log("\n--- Test Group: Rate Limiting ---");
  const testIp = "192.168.1.100";
  const testSlug = "rate-limit-test-group";
  resetRateLimit(testIp, testSlug);

  const initialCheck = checkRateLimit(testIp, testSlug);
  assert(!initialCheck.isLimited && initialCheck.remainingAttempts === 5, "Initial state has 5 attempts and is not limited");

  for (let i = 1; i <= 4; i++) {
    const attempt = recordFailedAttempt(testIp, testSlug);
    assert(!attempt.isLimited && attempt.remainingAttempts === 5 - i, `Attempt ${i} recorded, ${5 - i} remaining`);
  }

  const fifthAttempt = recordFailedAttempt(testIp, testSlug);
  assert(fifthAttempt.isLimited && fifthAttempt.remainingAttempts === 0, "5th failed attempt triggers rate limit lockout");

  const blockedCheck = checkRateLimit(testIp, testSlug);
  assert(blockedCheck.isLimited, "Subsequent check remains rate limited");

  resetRateLimit(testIp, testSlug);
  const resetCheck = checkRateLimit(testIp, testSlug);
  assert(!resetCheck.isLimited && resetCheck.remainingAttempts === 5, "Reset clears rate limit completely");

  // 5. Validation: Group Creation
  console.log("\n--- Test Group: Group Creation Validation ---");
  assert(validateGroupCreation("CS101", "password123", true).valid === true, "Valid group creation passes");
  assert(validateGroupCreation("", "password123", true).valid === false, "Empty group name rejected");
  assert(validateGroupCreation("Valid Group", "12345", true).valid === false, "Key under 6 characters rejected");
  assert(validateGroupCreation("A".repeat(81), "password123", true).valid === false, "Group name over 80 chars rejected");

  // 6. Validation: Lab Code Upload & 200KB limit
  console.log("\n--- Test Group: Lab Code Upload Validation ---");
  assert(validateLabCodeUpload("Binary Search", "python", "def search(): pass").valid === true, "Valid lab code upload passes");
  assert(validateLabCodeUpload("", "python", "def search(): pass").valid === false, "Empty title rejected");
  assert(validateLabCodeUpload("Title", "", "def search(): pass").valid === false, "Empty language rejected");
  assert(validateLabCodeUpload("Title", "python", "").valid === false, "Empty code body rejected");

  const oversizedCode = "x".repeat(MAX_CODE_BYTES + 100);
  const oversizedResult = validateLabCodeUpload("Big Code", "python", oversizedCode);
  assert(oversizedResult.valid === false && (oversizedResult.error || "").includes("200KB"), "Payload exceeding 200KB rejected");

  console.log("\n=========================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
