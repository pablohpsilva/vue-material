<template>
  <div class="Typeahead__Wrapper">
    <input
      class="md-input"
      ref="input"
      :name="name"
      :type="type"
      :value="value"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @focus="onFocus"
      @blur="onBlur"
      @input="onUpdate">
      <!-- @keydown.up="onInput"
      @keydown.down="onInput"> -->

      <md-button class="md-icon-button Typeahead__IconButton"
        md-disabled>
        <md-icon>search</md-icon>
      </md-button>

      <ul class="md-list md-theme-default Typeahead__List"
        md-disabled
        v-show="loading">
        <li class="md-list-item md-menu-item md-option Typeahead__Item"
          md-disabled
          :class="activeClass(index)"
          v-for="(item, index) in items"
          @click.native="hit"
          @mousedown="hit"
          @mousemove="setActive(index)">
          {{item.name}}
          <md-button @click.native="hit"
            md-disabled
            @mousemove="setActive(index)">
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
      name: String,
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
      },
      limit: {
        default() {
          return null;
        }
      }
    },
    data() {
      return {
        items: [],
        current: -1,
        loading: false,
        selectFirst: true,
        selected: null
      };
    },
    computed: {
      hasItems() {
        // debugger;
        return this.items.length > 0;
      },

      isEmpty() {
        // debugger;
        return !this.$el.value;
      },

      isDirty() {
        // debugger;
        return !!this.$el.value;
      },

      hasSelected() {
        // debugger;
        return !!(this.selected && this.$el.value.length);
      }
    },
    methods: {
      onUpdate() {
        // debugger;

        this.$el = this.$refs.input;

        this.onInputCustom();

        const value = this.$el.value;

        if (!value) {
          return this.clearResultList();
        }

        if (this.minChars && value.length < this.minChars) {
          return;
        }

        this.loading = true;

        this.callFetch();
      },

      onInputCustom() {
        // debugger;
        this.$el = this.$refs.input;

        const val = this.$el.value;

        this.setParentValue(val);
        this.parentContainer.inputLength = val ? val.length : 0;
        this.$emit('change', val);
        this.$emit('input', val);
      },

      setSelected(hit) {
        // debugger;
        this.selected = hit;
        this.$emit('selected', hit);
      },

      callFetch() {
        // debugger;
        if (this.fetchFunction) {
          this.fetchFunction().then((response) => this.handleRequest(response));
          return;
        }

        // TODO: Remove this call. For testing purposes ONLY
        this.fetch().then((response) => this.handleRequest(response));
      },

       // TODO: Remove this function. For testing purposes ONLY
      fetch() {
        // debugger;
        this.$el = this.$refs.input;

        if (!this.$http) {
          return console.warn('You need to install the `vue-resource` plugin', this);
        }

        if (!this.url) {
          return console.warn('You need to set the `src` property', this);
        }

        const src = this.queryParam
          ? this.url
          : this.url + this.query;

        const value = this.$el.value + '';

        const params = this.queryParam
          ? Object.assign({ [this.queryParam]: value }, this.data)
          : this.data;

        return this.$http.get(src, { params });
      },

      handleRequest(response) {
        this.$el = this.$refs.input;

        // debugger;
        if (response.data) {
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

      clearResultList() {
        // debugger;
        this.items = [];
        this.loading = false;
      },

      setActive(index) {
        // debugger;
        this.current = index;
      },

      activeClass(index) {
        // debugger;
        return {
          active: this.current === index
        };
      },

      hit() {
        // debugger;
        this.$el = this.$refs.input;

        if (this.current !== -1) {
          this.onHit(this.items[this.current]);
        }

        this.onInputCustom();
      },

      up() {
        // debugger;
        if (this.current - 1 < 0) {
          this.current = this.items.length - 1;
          return;
        }

        this.current -= 1;
        this.onInputCustom();
      },

      down() {
        // debugger;
        if (this.current + 1 >= this.items.length) {
          this.current = 0;
          return;
        }
        this.current += 1;
        this.onInputCustom();
      },

      onHit(hit) {
        debugger;
        this.$el = this.$refs.input;

        const aux = JSON.parse(JSON.stringify(hit));

        this.$el.value = aux.name || aux.nome || aux.title;

        this.setSelected(aux);

        // this.clearResultList();
      },

      onBlurCustom() {
        // debugger;
        this.$el = this.$refs.input;

        if (!this.parentContainer) {
          this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');
        }
        this.parentContainer.isFocused = false;
        this.clearResultList();
        this.setParentValue();
      }
    },
    mounted() {
      this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');

      if (!this.parentContainer) {
        this.$destroy();

        throw new Error('You should wrap the md-input in a md-input-container');
      }

      this.$el = this.$refs.input;

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
