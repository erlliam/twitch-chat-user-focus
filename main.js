let previousScrollTop = 0;
let currentFocusUsername = null;

let chatLogElement = document.querySelector('[role="log"]');
let chatInputButtonsContainerElement = document.querySelector(".hfeqK");
let currentlyFocusedElement = document.createElement("div");

function main() {
  let  observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (let node of mutation.addedNodes) {
          if (currentFocusUsername) {
            hideMessageIfUsernameMismatch(node, currentFocusUsername);
          }
        }
      }
    }
  });
  observer.observe(chatLogElement, { childList: true });

  currentlyFocusedElement.innerHTML = "<button>Unfocus</button>";
  currentlyFocusedElement.querySelector("button").addEventListener("click", handleUnfocusClick);
  document.body.addEventListener("dblclick", handleDoubleClick);
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
    insertFocusTextAndButton(username);
  }
}

function handleUnfocusClick(event) {
  currentlyFocusedElement.remove();

  let children = chatLogElement.children;
  for (let message of children) {
    message.style.display = "block";
  }

  returnToPreviousScrollTop();
  currentFocusUsername = null;
}


function setChatScrollTop() {
  previousScrollTop = document.querySelector(".iqhsCy > div:nth-child(2) > div:nth-child(3)").scrollTop;
}

function returnToPreviousScrollTop() {
  document.querySelector(".iqhsCy > div:nth-child(2) > div:nth-child(3)").scrollTop = previousScrollTop;
}

function insertFocusTextAndButton(username) {
  chatInputButtonsContainerElement.insertBefore(currentlyFocusedElement, chatInputButtonsContainerElement.lastChild);
}

function onlyShowMessagesByUser(username) {
  let children = chatLogElement.children;
  for (let message of children) {
    hideMessageIfUsernameMismatch(message, username);
  }
}

function hideMessageIfUsernameMismatch(message, username) {
  let chatMessageUsernameElement = message.querySelector('[data-a-target="chat-message-username"]');
  if (chatMessageUsernameElement === null) {
    return;
  }
  let messageUsername = getUsernameFromChatMessageUsername(chatMessageUsernameElement);
  if (messageUsername !== username) {
    message.style.display = "none";
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
