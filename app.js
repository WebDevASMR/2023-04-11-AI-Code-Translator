const apiKeyInput = document.getElementById("api-key");
const inputLanguageSelect = document.getElementById("input-language");
const inputCodeTextarea = document.getElementById("input-code");
const outputLanguageSelect = document.getElementById("output-language");
const outputCodeTextarea = document.getElementById("output-code");
const translateBtn = document.getElementById("translate-btn");
const languageOptions = [
  "JavaScript",
  "JSX",
  "PHP",
  "Python",
  "Ruby",
  "Swift",
  "SwiftUI",
  "TypeScript",
];

// set language options in the select elements
for (const [index, option] of languageOptions.entries()) {
  inputLanguageSelect.innerHTML += `
    <option value="${option.toLowerCase()}">
      ${option}
    </option>
  `;

  // set the 2nd option as the default for output language select
  if (index === 1) {
    outputLanguageSelect.innerHTML += `
      <option value="${option.toLowerCase()}" selected>
        ${option}
      </option>
    `;
  } else {
    outputLanguageSelect.innerHTML += `
      <option value="${option.toLowerCase()}">
        ${option}
      </option>
    `;
  }
}

// allow copying of the outputted code
outputCodeTextarea.addEventListener("click", async () => {
  const outputCode = outputCodeTextarea.value;

  try {
    await navigator.clipboard.writeText(outputCode);
    alert("Code has been copied to clipboard!");
  } catch (error) {
    console.error("Error copying code to clipboard", error);
  }
});

// handle translate button click
translateBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value;
  const inputLanguage = inputLanguageSelect.value;
  const outputLanguage = outputLanguageSelect.value;
  const inputCode = inputCodeTextarea.value;

  if (!apiKey) {
    alert("Please enter your API Key!");
    return;
  }

  if (!inputCode) {
    alert("Please enter your input code!");
    return;
  }

  if (inputLanguage === outputLanguage) {
    alert("Please select different languages!");
    return;
  }

  let prompt = `Translate the following ${inputLanguage} code to ${outputLanguage}:\n\n${inputCode}\n\n`;

  try {
    const translatedCode = await translateCode(apiKey, prompt);
    outputCodeTextarea.value = translatedCode;
  } catch (error) {
    console.error(error);
    alert(
      "An error occured while translating the code. Check the console for more details."
    );
  }
});

// use OpenAI to translate the code
async function translateCode(apiKey, prompt) {
  // modify elements whilst request is pending
  translateBtn.innerHTML = `<i class="fa fa-circle-notch fa-spin"></i>`;
  translateBtn.setAttribute("disabled", "true");
  inputLanguageSelect.setAttribute("disabled", "true");
  outputLanguageSelect.setAttribute("disabled", "true");

  // call OpenAI completions API with the prompt
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  // get the response and return it, also reset the elements to their previous state
  const data = await response.json();
  console.log(data);
  const translatedCode = data.choices[0].message.content.trim();
  translateBtn.innerText = "Translate Code";
  translateBtn.removeAttribute("disabled");
  inputLanguageSelect.removeAttribute("disabled");
  outputLanguageSelect.removeAttribute("disabled");
  return translatedCode;
}
