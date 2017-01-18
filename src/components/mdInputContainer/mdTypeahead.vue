<template>
  <div class="Typeahead__Wrapper">
    <input
      class="md-input"
      :type="type"
      :value="value"
      :name="name"
      :disabled="disabled"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxlength"
      ref="input"
      @keydown.down="down"
      @keydown.up="up"
      @keydown.enter="hit"
      @keydown.esc="reset"
      @focus="onFocus"
      @blur="onBlurCustom"
      @input="onUpdate">

    <md-button class="md-icon-button Typeahead__IconButton"
      md-disabled
      @click="callFetch">
      <md-icon>search</md-icon>
    </md-button>

    <ul class="md-list md-theme-default Typeahead__List"
      md-disabled
      v-show="hasItems">
      <li class="md-list-item md-menu-item md-option Typeahead__Item"
        md-disabled
        :class="activeClass(index)"
        v-for="(item, index) in items"
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
        return !this.$refs.input.value;
      },

      isDirty() {
        return !!this.$refs.input.value;
      },

      hasSelected() {
        return !!(this.selected && this.$refs.input.value.length);
      }

      // selectedText() {
      //   return this.selected ?
      //     this.selected.name || this.selected.nome || this.selected.title :
      //     '';
      // }
    },
    methods: {
      onUpdate() {
        const value = this.$refs.input.value;

        if (!value) {
          return this.reset();
        }

        if (this.minChars && value.length < this.minChars) {
          return;
        }

        this.loading = true;

        this.callFetch();
      },

      onInput() {
        const val = this.$refs.input.value;

        this.setParentValue(val);
        this.parentContainer.inputLength = val ? val.length : 0;
        this.$emit('change', val);
        this.$emit('input', val);
      },

      setSelected(hit) {
        this.selected = hit;
        this.$emit('selected', hit);
      },

      callFetch() {
        if (this.fetchFunction) {
          this.fetchFunction().then((response) => this.handleRequest(response));
          return;
        }

        // TODO: Remove this call. For testing purposes ONLY
        this.fetch().then((response) => this.handleRequest(response));
      },

       // TODO: Remove this function. For testing purposes ONLY
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
          ? Object.assign({ [this.queryParam]: this.$refs.input.value.toString() }, this.data)
          : this.data;

        return this.$http.get(src, { params });
      },

      handleRequest(response) {
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
        debugger;
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
        this.$refs.input.value = hit.name || hit.nome || hit.title;

        this.setSelected(hit);

        this.reset();
      },

      onBlurCustom() {
        setTimeout(() => {
          this.parentContainer.isFocused = false;
          this.reset();
          this.setParentValue();
        }, 1E2);
      },

      setParentValue(value) {
        const refValue = this.$refs.input.value ?
          this.$refs.input.value :
          '';

        this.parentContainer.setValue(value || refValue.toString());
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
