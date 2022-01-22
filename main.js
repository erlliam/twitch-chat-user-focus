class CurrentlyFocusedElement {
  constructor() {
    this._element = document.createElement("div");
    this._init();
  }

  _init() {
    this._element.classList.add("tcuf-unfocus-container");
    this._element.innerHTML = `
      <button>Unfocus</button>
    `;

    this._element.addEventListener("click", this._handleClick.bind(this));
  }

  _handleClick() {
    this._hide();
    showAllMessages();
  }

  _hide() {
    this._element.remove();
  }

  addClickEventListener(callback) {
    this._element.addEventListener("click", callback);
  }

  show() {
    chatInputButtonsContainerElement.insertBefore(this._element, chatInputButtonsContainerElement.lastChild);
  }
}

let previousScrollTop = 0;
let currentFocusUsername = null;

let chatLogElement = document.querySelector('[role="log"]');
let chatInputButtonsContainerElement = document.querySelector(".hfeqK");
let currentlyFocusedElement = new CurrentlyFocusedElement();
currentlyFocusedElement.addClickEventListener(showAllMessages);

function main() {
  setUpChatLogChildObeserver();

  cleanUpExistingStyleSheet();
  injectStyleSheet();

  document.body.addEventListener("dblclick", handleDoubleClick);
}

function setUpChatLogChildObeserver() {
  let  observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (let node of mutation.addedNodes) {
          handleNewChatLogElement(node);
        }
      }
    }
  });
  observer.observe(chatLogElement, { childList: true });
}

function cleanUpExistingStyleSheet() {
  document.getElementById("tcufStyleSheet")?.remove();
}

function injectStyleSheet() {
  let styleSheet = document.createElement("style");
  styleSheet.id = "tcufStyleSheet";
  styleSheet.textContent = `
    .tcuf-hidden {
      display: none;
    }

    .tcuf-unfocus-container {
      display: flex;
    }

    .tcuf-unfocus-container > button {
      border: 1px solid;
      border-radius: 8px;
      padding: 0rem 1rem;
    }
  `;
  document.head.append(styleSheet);
}

function handleNewChatLogElement(element) {
  if (currentFocusUsername) {
    hideMessageIfUsernameMismatch(element, currentFocusUsername);
  }
}

function handleDoubleClick(event) {
  let username;
  if (isChatMessageUsername(event.target)) {
    username = getUsernameFromChatMessageUsername(event.target);
  } else if (isDescendentOfViewerCardPositioner(event.target)) {
    username = getUsernameFromDescendentOfViewerCardPositioner(event.target);
  }

  if (username) {
    setChatScrollTop();
    currentFocusUsername = username;
    onlyShowMessagesByUser(username);
    currentlyFocusedElement.show();
  }
}

function setChatScrollTop() {
  previousScrollTop = document.querySelector(".iqhsCy > div:nth-child(2) > div:nth-child(3)").scrollTop;
}

function returnToPreviousScrollTop() {
  document.querySelector(".iqhsCy > div:nth-child(2) > div:nth-child(3)").scrollTop = previousScrollTop;
}

function onlyShowMessagesByUser(username) {
  let children = chatLogElement.children;
  for (let message of children) {
    hideMessageIfUsernameMismatch(message, username);
  }
}

function showAllMessages() {
  let children = chatLogElement.children;
  for (let message of children) {
    message.classList.remove("tcuf-hidden");
  }

  returnToPreviousScrollTop();
  currentFocusUsername = null;
}

function hideMessageIfUsernameMismatch(message, username) {
  let chatMessageUsernameElement = message.querySelector('[data-a-target="chat-message-username"]');
  if (chatMessageUsernameElement === null) {
    return;
  }
  let messageUsername = getUsernameFromChatMessageUsername(chatMessageUsernameElement);
  if (messageUsername !== username) {
    message.classList.add("tcuf-hidden");
  }
}

function isChatMessageUsername(element) {
  return element?.dataset.aTarget === "chat-message-username";
}

function isDescendentOfViewerCardPositioner(element) {
  let closestResult = element.closest('[data-a-target="viewer-card-positioner"]')
  return closestResult !== null;
}

function getUsernameFromChatMessageUsername(element) {
  return element.dataset.aUser;
}

function getUsernameFromDescendentOfViewerCardPositioner(element) {
  let viewerCardPositioner = element.closest('[data-a-target="viewer-card-positioner"]')
  let aElement = viewerCardPositioner.querySelector("a");
  let url = new URL(aElement.href);
  let username = url.pathname.substring(1);
  return username;
}

main();
