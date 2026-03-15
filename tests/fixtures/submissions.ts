// ============================================================
// Test fixtures for submissions
// Add new cases here → all related tests auto-expand
// ============================================================

export const VALID_SUBMISSIONS = [
  {
    name: "Korean rant",
    text: "배달앱에서 리뷰 사진만 모아서 보고 싶은데 왜 안 돼요",
    email: "user@example.com",
  },
  {
    name: "English rant",
    text: "I wish I could compare grocery prices across delivery apps automatically",
    email: "test@gmail.com",
  },
  {
    name: "No email",
    text: "Why is there no simple app that tracks my water intake based on weather?",
    email: null,
  },
  {
    name: "Empty email string",
    text: "I hate how every app requires a login just to browse",
    email: "",
  },
  {
    name: "Minimal text",
    text: "a",
    email: null,
  },
  {
    name: "Unicode/emoji",
    text: "카페에서 콘센트 있는 자리 실시간으로 알려주는 앱 없나요?? 😤🔌",
    email: "émoji@例え.jp",
  },
  {
    name: "Multi-line rant",
    text: `진짜 짜증나는 게 있는데요
    
    배달앱에서 리뷰를 보면 사진이랑 텍스트가 섞여있잖아요
    근데 사진만 쭉 보고 싶을 때가 있거든요
    
    왜 이런 기능이 없는 거죠??`,
    email: null,
  },
] as const;

export const INVALID_SUBMISSIONS = [
  {
    name: "Empty text",
    text: "",
    email: null,
    expectedError: "Text is required",
  },
  {
    name: "Whitespace only",
    text: "   \n\t  ",
    email: null,
    expectedError: "Text cannot be empty",
  },
  {
    name: "Null text",
    text: null,
    email: null,
    expectedError: "Text is required",
  },
  {
    name: "Undefined text",
    text: undefined,
    email: null,
    expectedError: "Text is required",
  },
  {
    name: "Number as text",
    text: 12345,
    email: null,
    expectedError: "Text is required",
  },
  {
    name: "Text too long",
    text: "a".repeat(2001),
    email: null,
    expectedError: "2000 characters or less",
  },
  {
    name: "Invalid email format",
    text: "Valid complaint here",
    email: "not-an-email",
    expectedError: "Invalid email format",
  },
  {
    name: "Email too long",
    text: "Valid complaint here",
    email: "a".repeat(310) + "@example.com",
    expectedError: "320 characters or less",
  },
] as const;

export const XSS_PAYLOADS = [
  {
    name: "Script tag",
    input: '<script>alert("xss")</script>Real complaint',
    expected: 'alert("xss")Real complaint',
  },
  {
    name: "IMG onerror",
    input: '<img src=x onerror=alert(1)>I hate this app',
    expected: "I hate this app",
  },
  {
    name: "Nested tags",
    input: "<div><b>bold</b><script>hack()</script></div>Normal text",
    expected: "boldhack()Normal text",
  },
  {
    name: "Event handler",
    input: '<a href="javascript:alert(1)">click</a> Fix this please',
    expected: "click Fix this please",
  },
  {
    name: "Clean text (no tags)",
    input: "This is a normal complaint with <no> issues... or > problems",
    expected: "This is a normal complaint with  issues... or > problems",
  },
] as const;

export const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60_000,
} as const;
