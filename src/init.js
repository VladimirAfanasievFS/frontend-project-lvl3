import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
import { differenceBy, uniqueId } from 'lodash';
import axios from 'axios';
import { setLocale, string } from 'yup';

import {
  renderFeedback, renderFeeds, renderFormError, renderModal, renderPosts,
} from './view.js';
import resources from './locales/index.js';
import {
  ERROR, INIT, INVALID, LOADING, SUCCESS, VALID,
} from './constants.js';
import parseRss from './parseRss.js';
import yupLocale from './locales/yupLocale.js';

const prepareUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;

const getNewPosts = (state, feed) => {
  const { url, id } = feed;

  axios.get(prepareUrl(url))
    .then((response) => {
      const { items } = parseRss(response.data.contents);
      const filteredPosts = state.posts.filter(({ feedId }) => feedId === id);
      const newPosts = differenceBy(items, filteredPosts, 'guid');
      newPosts.map((item) => ({
        ...item,
        feedId: id,
      }));
      state.posts = [...newPosts, ...state.posts];
      console.log('completed');
    });
};

const updateFeeds = (state) => {
  const requests = state.feeds.map((feed) => getNewPosts(state, feed));
  Promise.all(requests).finally(() => {
    setTimeout(() => {
      console.log('timeout');
      updateFeeds(state);
    }, 5000);
  });
};

export default async () => {
  const defaultLanguage = 'ru';

  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const state = {
    lng: defaultLanguage,
    urlInput: '',
    form: { state: INIT, error: null },
    process: { state: INIT, error: null },
    posts: [],
    feeds: [],
    selectedPostId: null,
    ui: {
      seenPosts: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    modal: document.querySelector('.modal'),
  };

  const watchedState = onChange(state, (path, value) => {
    // console.log('🚀 ~ file: init.js ~ line 33 ~ watchedState ~ value', value);
    // console.log('🚀 ~ file: init.js ~ line 33 ~ watchedState ~ path', path);
    // console.log('🚀 ~ file: init.js ~ line 31 ~ watchedState ~ state', state);
    switch (path) {
      // инициализированный объект i18n прокидывается параметром в рендер, чтобы использовать t.
      // case 'lng': i18nInstance.changeLanguage(value).then(() => render(container, watchedState, i18nInstance));
      //   break;
      case 'selectedPostId':
        renderModal(elements, state);
        break;
      case 'ui.seenPosts':
      case 'posts':
        renderPosts(elements, state, i18nInstance);
        break;
      case 'feeds':
        renderFeeds(elements, value, i18nInstance);
        break;
      case 'process':
        renderFeedback(elements, value, i18nInstance);
        break;
      case 'form':
        renderFormError(elements, value, i18nInstance);
        break;
      default:
        break;
    }
  });

  // elements.urlInput.addEventListener('input', (e) => {
  //   watchedState.urlInput = e.target.value;
  // });
  elements.posts.addEventListener('click', (event) => {
    console.log(event.target.dataset);
    console.log(event.target.dataset.id);
    if (event.target.dataset.id) {
      const { id } = event.target.dataset;
      watchedState.selectedPostId = String(id);
      watchedState.ui.seenPosts.add(id);
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setLocale(yupLocale);
    const existedUrls = watchedState.feeds.map(({ url }) => url);
    const schema = string().url().notOneOf(existedUrls).required();

    const url = data.get('url');
    schema.validate(url).then(() => {
      watchedState.form = { state: VALID, error: null };
      watchedState.process = { state: LOADING, error: null };

      axios.get(prepareUrl(url)).then((response) => {
        const {
          title,
          link,
          description,
          items,
        } = parseRss(response.data.contents);
        const feedId = uniqueId();
        watchedState.feeds = [...watchedState.feeds,
          {
            id: feedId, title, link, description, url,
          }];
        const posts = items.map((item) => ({ feedId, ...item }));
        watchedState.posts = [...posts, ...watchedState.posts];

        watchedState.process = { state: SUCCESS, error: null };
      }).catch((error) => {
        console.log('🚀 ~ file: view.js ~ line 63 ~ axios.get ~ error', error);
        watchedState.process = { state: ERROR, error: 'network' };
      });
    }).catch((error) => {
      watchedState.form = { state: INVALID, error: error.message.key };
    });
  });

  updateFeeds(watchedState);
};
