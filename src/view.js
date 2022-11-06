import {
  ERROR, INVALID, LOADING, SUCCESS,
} from './constants.js';

export const renderFormError = (elements, form, i18n) => {
  if (form.state === INVALID) {
    elements.urlInput.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(`errors.${form.error}`);
  } else {
    elements.urlInput.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.textContent = '';
  }
};

export const renderPosts = (elements, state, i18n) => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const titleH2 = document.createElement('h2');
  titleH2.classList.add('card-title', 'h4');
  titleH2.textContent = i18n.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach(({ link, title, guid }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    if (state.ui.seenPosts.has(guid)) {
      a.classList.add('fw-normal');
    } else {
      a.classList.add('fw-bold');
    }
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = guid;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18n.t('preview');

    li.appendChild(a);
    li.appendChild(button);
    ul.appendChild(li);
  });

  bodyDiv.appendChild(titleH2);
  cardDiv.appendChild(bodyDiv);
  cardDiv.appendChild(ul);

  elements.posts.textContent = '';
  elements.posts.appendChild(cardDiv);
};

export const renderFeeds = (elements, feeds, i18n) => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const titleH2 = document.createElement('h2');
  titleH2.classList.add('card-title', 'h4');
  titleH2.textContent = i18n.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach(({ description, title }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;

    li.appendChild(h3);
    li.appendChild(p);
    ul.appendChild(li);
  });

  bodyDiv.appendChild(titleH2);
  cardDiv.appendChild(bodyDiv);
  cardDiv.appendChild(ul);

  elements.feeds.textContent = '';
  elements.feeds.appendChild(cardDiv);
};

export const renderFeedback = (elements, process, i18n) => {
  if (process.state === SUCCESS) {
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18n.t('loading.success');
    elements.urlInput.value = '';
    elements.urlInput.focus();
    elements.submitButton.removeAttribute('disabled');
  } else if (process.state === LOADING) {
    elements.submitButton.setAttribute('disabled', true);
  } else if (process.state === ERROR) {
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(`errors.${process.error}`);
    elements.submitButton.removeAttribute('disabled');
  }
};

export const renderModal = (elements, state) => {
  const post = state.posts.find(({ guid }) => guid === state.selectedPostId);
  const title = elements.modal.querySelector('.modal-title');
  const body = elements.modal.querySelector('.modal-body');
  const fullArticleBtn = elements.modal.querySelector('.full-article');

  title.textContent = post.title;
  body.textContent = post.description;
  fullArticleBtn.href = post.link;
};
