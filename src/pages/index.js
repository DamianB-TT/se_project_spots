import "./index.css";
import {
  enableValidation,
  resetValidation,
  settings,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1075a627-0419-4593-b401-b014410f85b6",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    cards.forEach(function (item) {
      renderCard(item, "append");
    });
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    profileAvatarEl.src = userInfo.avatar;
  })
  .catch(console.error);

const closeButtons = document.querySelectorAll(".modal__close-btn");

const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

// AVATAR MODAL SELECTORS (DELETE UNNECESSARY ONES AFTER COMPLETION)
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteCancelBtn = deleteModal.querySelector(".modal__submit-btn_cancel");
const deleteForm = deleteModal.querySelector(".modal__form-delete");
const deleteSubmitBtn = deleteModal.querySelector(".modal__submit-btn_delete");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostSubmitBtn = newPostForm.querySelector(
  settings.submitButtonSelector,
);
const newPostLinkInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector("#card-caption-input");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const likeButtonEl = cardElement.querySelector(".card__like-btn");

  if (data.isLiked) {
    likeButtonEl.classList.add("card__like-btn_active");
  }

  likeButtonEl.addEventListener("click", (evt) => handleLike(evt, data._id));

  const deleteButtonEl = cardElement.querySelector(".card__delete-btn");
  deleteButtonEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data),
  );

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  modal.addEventListener("mousedown", closeOnOverlay);
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  modal.removeEventListener("mousedown", closeOnOverlay);
  document.removeEventListener("keydown", handleEscape);
}

function closeOnOverlay(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openModalEl = document.querySelector(".modal_is-opened");
    if (openModalEl) {
      closeModal(openModalEl);
    }
  }
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings,
  );
  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserAvatar(avatarInput.value)
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

editProfileForm.addEventListener("submit", handleProfileFormSubmit);

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .addCard({ name: newPostCaptionInput.value, link: newPostLinkInput.value })
    .then((data) => {
      renderCard(data, "prepend");
      evt.target.reset();
      disableButton(newPostSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(deleteSubmitBtn, true, "Delete", "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteSubmitBtn, false, "Delete", "Deleting...");
    });
}

function handleLike(evt, id) {
  api
    .handleLike(id, evt.target.classList.contains("card__like-btn_active"))
    .then(() => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

newPostForm.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

enableValidation(settings);
