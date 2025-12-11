// This string simulates the HTML content you might get from exporting a Word doc.
// In a real scenario, you could fetch this from a .html file or paste the content here.

export const RAW_HTML_DATA = `
<p><b>Question 1: Which of the following is a primary color?</b></p>
<p>a. Green</p>
<p><b>b. Red</b></p>
<p>c. Purple</p>
<p>d. Orange</p>

<p><b>Question 2: Select all the mammals from the list below:</b></p>
<p><b>a. Dolphin</b></p>
<p>b. Shark</p>
<p><b>c. Blue Whale</b></p>
<p>d. Tuna</p>

<p><b>Question 3: What is the capital of France?</b></p>
<p>a. London</p>
<p>b. Berlin</p>
<p><b>c. Paris</b></p>
<p>d. Rome</p>

<p><b>Question 4: Which of these are JavaScript frameworks/libraries?</b></p>
<p><b>a. React</b></p>
<p>b. Laravel</p>
<p><b>c. Vue</b></p>
<p>d. Django</p>

<p><b>Question 5: HTML stands for?</b></p>
<p>a. HyperLinks and Text Markup Language</p>
<p><b>b. HyperText Markup Language</b></p>
<p>c. Home Tool Markup Language</p>
<p>d. Hyper Tool Markup Language</p>

<p><b>Question 6: Which planet is known as the Red Planet?</b></p>
<p>a. Venus</p>
<p><b>b. Mars</b></p>
<p>c. Jupiter</p>
<p>d. Saturn</p>

<p><b>Question 7: The chemical symbol for Gold is:</b></p>
<p>a. Ag</p>
<p>b. Gd</p>
<p><b>c. Au</b></p>
<p>d. Go</p>

<p><b>Question 8: In React, which hook is used for side effects?</b></p>
<p>a. useState</p>
<p><b>b. useEffect</b></p>
<p>c. useReducer</p>
<p>d. useMemo</p>

<p><b>Question 9: CSS stands for:</b></p>
<p><b>a. Cascading Style Sheets</b></p>
<p>b. Computer Style Sheets</p>
<p>c. Creative Style Sheets</p>
<p>d. Colorful Style Sheets</p>

<p><b>Question 10: Which company developed TypeScript?</b></p>
<p>a. Google</p>
<p>b. Facebook</p>
<p>c. Apple</p>
<p><b>d. Microsoft</b></p>
`;

// Generating more dummy data to hit the 165 count requirement for simulation logic
export const generateDummyRawData = () => {
  let data = RAW_HTML_DATA;
  for(let i = 11; i <= 165; i++) {
    data += `
    <p><b>Question ${i}: This is a generated question number ${i} to simulate a full bank. The answer is 'a' and 'c'.</b></p>
    <p><b>a. Correct Option A</b></p>
    <p>b. Incorrect Option B</p>
    <p><b>c. Correct Option C</b></p>
    <p>d. Incorrect Option D</p>
    `;
  }
  return data;
}
