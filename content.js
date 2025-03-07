console.log("Email Writer Extension - content.js script loaded");

function createAIToneDropdown() {
  const dropdown = document.createElement("select");
  dropdown.className = "ai-tone-dropdown";
  dropdown.style.marginLeft = "-10px";
  dropdown.style.marginRight = "8px";
  dropdown.style.width = "23px";
  dropdown.style.height = "36px";
  dropdown.style.backgroundColor = "#0b57d0";
  dropdown.style.color = "#fff";
  dropdown.style.cursor = "pointer";
  //   dropdown.style.borderRadius = "18px";
  dropdown.style.borderBottomLeftRadius = "0px";
  dropdown.style.borderTopLeftRadius = "0px";
  dropdown.style.borderBottomRightRadius = "18px";
  dropdown.style.borderTopRightRadius = "18px";

  const tones = ["Professional", "Casual", "Friendly", "Formal", "Humor"];
  tones.forEach((tone) => {
    const option = document.createElement("option");
    option.style.backgroundColor = "#fff";
    option.style.color = "black";
    option.style.fontSize = "15px";
    option.style.cursor = "pointer";
    option.value = tone.toLowerCase();
    option.innerText = tone;
    dropdown.appendChild(option);
  });

  return dropdown;
}

function createAIButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.style.backgroundColor = "#0b57d0";
  //   button.style.borderRadius = "18px";
  button.style.borderBottomLeftRadius = "18px";
  button.style.borderTopLeftRadius = "18px";
  button.style.borderBottomRightRadius = "0px";
  button.style.borderTopRightRadius = "0px";
  button.style.borderRight = "0.2px solid #444746";

  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  return button;
}

function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];

  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) return content.innerText.trim();
  }
  return "";
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];

  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) return toolbar;
  }
  return null;
}

// Main Function
function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();
  const existingDropdown = document.querySelector(".ai-tone-dropdown");
  if (existingDropdown) existingDropdown.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, creating AI reply button");

  // Create button and dropdown
  const toneDropdown = createAIToneDropdown();
  const button = createAIButton();
  button.classList.add("ai-reply-button");
  toneDropdown.classList.add("ai-tone-dropdown");

  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;

      const emailContent = getEmailContent();
      const selectedTone = toneDropdown.value; // Get selected tone

      // const LocalURL=http://localhost:8080/api/email/generate
      const response = await fetch(
        "https://mailcraft-c40i.onrender.com/api/email/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailContent, tone: selectedTone }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AI reply");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );

      if (composeBox) {
        composeBox.focus();
        composeBox.innerHTML = "";
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.error("Compose box not found");
      }
    } catch (error) {
      alert("Failed to generate AI reply.");
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });

  // Insert the dropdown and button into the toolbar
  toolbar.insertBefore(toneDropdown, toolbar.firstChild);
  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(".aDh, .btC, [role='dialog']") ||
          node.querySelector(".aDh, .btC, [role='dialog']"))
    );

    if (hasComposeElements) {
      console.log("Compose window detected");
      setTimeout(injectButton, 500); // Ensure the compose window is fully loaded before injecting the button
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
