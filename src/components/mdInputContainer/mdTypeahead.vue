<template>
  <div class="Typeahead__Wrapper">
    <input
      class="md-input"
      :type="type"
      :value="value"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @keydown.down="down"
      @keydown.up="up"
      @keydown.enter="hit"
      @keydown.esc="reset"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput">

    <md-button class="md-icon-button Typeahead__IconButton"
      @click="callFetch">
      <md-icon>search</md-icon>
    </md-button>

    <ul class="md-list md-theme-default Typeahead__List"
      v-show="hasItems">
      <li class="md-list-item md-menu-item md-option Typeahead__Item"
        :class="activeClass(index)"
        v-for="(item, index) in items"
        @mousedown="hit"
        @mousemove="setActive(index)">
        <md-button @click.native="hit"
          @mousemove="setActive(index)">
          {{item.name}}
        </md-button>
      </li>
    </ul>
  </div>
</template>

<script>
  import common from './common';
  import getClosestVueParent from '../../core/utils/getClosestVueParent';

  export default {
    mixins: [common],
    props: {
      type: {
        type: String,
        default: 'text'
      },
      url: {
        type: String,
        default() {
          return 'https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search';
        }
      },
      queryParam: {
        type: String,
        default() {
          return 'q';
        }
      },
      minChars: {
        type: Number,
        default() {
          return 3;
        }
      },
      fetchFunction: {
        type: Function,
        required: false
      }
    },
    data() {
      return {
        items: [],
        current: -1,
        loading: false,
        selectFirst: false,
        selected: null
      };
    },
    computed: {
      hasItems() {
        return this.items.length > 0;
      },

      isEmpty() {
        return !this.value;
      },

      isDirty() {
        return !!this.value;
      },

      hasSelected() {
        return !!(this.selected && this.value.length);
      },

      selectedText() {
        return this.selected ?
          this.selected.name || this.selected.nome || this.selected.title :
          '';
      }
    },
    methods: {
      onUpdate() {
        this.onInput();

        if (!this.value) {
          return this.reset();
        }

        if (this.minChars && this.value.length < this.minChars) {
          return;
        }

        this.loading = true;

        this.callFetch();
      },

      onInput2() {
        const value = this.$el.value;

        this.setParentValue(value);
        this.parentContainer.inputLength = value ? value.length : 0;
        this.$emit('change', value);
        this.$emit('input', value);

        // this.onUpdate()
      },

      callFetch() {
        if (this.fetchFunction) {
          this.fetchFunction().then((response) => this.handleRequest(response));
          return;
        }

        this.fetch().then((response) => this.handleRequest(response));
      },

      fetch() {
        if (!this.$http) {
          return console.warn('You need to install the `vue-resource` plugin', this);
        }

        if (!this.url) {
          return console.warn('You need to set the `src` property', this);
        }

        const src = this.queryParam
          ? this.url
          : this.url + this.query;

        const params = this.queryParam
          ? Object.assign({ [this.queryParam]: this.query }, this.data)
          : this.data;

        return this.$http.get(src, { params });
      },

      handleRequest(response) {
        if (this.value) {
          let data = response.data;

          data = this.prepareResponseData ?
            this.prepareResponseData(data) :
            data;
          this.items = this.limit ?
            data.slice(0, this.limit) :
            data;
          this.current = -1;
          this.loading = false;

          if (this.selectFirst) {
            this.down();
          }
        }
      },

      reset() {
        this.items = [];
        this.loading = false;
      },

      setActive(index) {
        this.current = index;
      },

      activeClass(index) {
        return {
          active: this.current === index
        };
      },

      hit() {
        if (this.current !== -1) {
          this.onHit(this.items[this.current]);
        }
        this.onInput();
      },

      up() {
        if (this.current - 1 < 0) {
          this.current = this.items.length - 1;
          return;
        }

        this.current -= 1;
        this.onInput();
      },

      down() {
        if (this.current + 1
           >= this.items.length) {
          this.current = 0;
          return;
        }
        this.current += 1;
      },

      onHit(hit) {
        this.selected = hit;
        this.value = this.selectedText;

        this.$emit('selected', hit);

        this.reset();
      },

      onBlur() {
        setTimeout(() => {
          this.parentContainer.isFocused = false;
          this.reset();
        }, 1E2);
      }
    },
    mounted() {
      this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');

      if (!this.parentContainer) {
        this.$destroy();

        throw new Error('You should wrap the md-input in a md-input-container');
      }

      this.setParentDisabled();
      this.setParentRequired();
      this.setParentPlaceholder();
      this.setParentValue();
      this.handleMaxLength();
    }
  };
</script>

<style lang="css" scoped>
  .Typeahead__Wrapper {
    width: 100%;
  }

  .md-list.Typeahead__List {
    position: absolute;
    width: 100%;
    z-index: 10;
    max-height: 200px;
    overflow-y: scroll;
  }

  .Typeahead__Item.active {
    background-color: rgba(153, 153, 153, 0.2);
    text-decoration: none;
  }

  .Typeahead__Item.active .md-button.md-theme-default {
    background-color: transparent;
  }

  .Typeahead__IconButton {
    position: absolute;
    right: 0;
    top: 12px;
  }

  .Typeahead__IconButton .md-icon {
    color: rgba(0,0,0,0.7);
  }
</style>
