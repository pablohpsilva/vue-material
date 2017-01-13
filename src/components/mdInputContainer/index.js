import mdInputContainer from './mdInputContainer.vue';
import mdInput from './mdInput.vue';
import mdTypeahead from './mdTypeahead.vue';
import mdTextarea from './mdTextarea.vue';
import mdInputContainerTheme from './mdInputContainer.theme';

export default function install(Vue) {
  Vue.component('md-input-container', mdInputContainer);
  Vue.component('md-input', mdInput);
  Vue.component('md-typeahead', mdTypeahead);
  Vue.component('md-textarea', mdTextarea);

  Vue.material.styles.push(mdInputContainerTheme);
}
