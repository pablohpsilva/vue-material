<template lang="html">
  <div class="md-chips md-chips-autocomplete"
    :class="[themeClass, classes]"
    @focus="onFocus"
    @blur="onBlur">
    <md-chip
      v-for="chip in selectedChips"
      :md-deletable="!mdStatic"
      :disabled="disabled"
      @delete="deleteChip(chip)">
      <slot :value="chip"></slot>
    </md-chip>

    <md-autocomplete
      v-model="currentChip"
      ref="autocomplete"
      :debounce="debounce"
      :disabled="disabled"
      :required="required"
      :fetch="fetch"
      :filterList="filterList"
      :placeholder="mdInputPlaceholder"
      :id="inputId"
      :list="list"
      :prepareResponseData="prepareResponseData"
      :printAttribute="printAttribute"
      :queryParam="queryParam"
      @selected="addChip"/>
  </div>
</template>

<script>
  import theme from '../../core/components/mdTheme/mixin';
  import uniqueId from '../../core/utils/uniqueId';
  import getClosestVueParent from '../../core/utils/getClosestVueParent';

  export default {
    props: {
      debounce: {
        type: Number,
        default: 1E3
      },
      disabled: Boolean,
      fetch: Function,
      filterList: Function,
      list: {
        type: Array,
        default() {
          return [];
        }
      },
      mdInputId: String,
      mdInputName: String,
      mdInputPlaceholder: String,
      mdInputType: {
        type: String,
        default: 'text'
      },
      mdMax: {
        type: Number,
        default: Infinity
      },
      mdStatic: Boolean,
      minChars: {
        type: Number,
        default: 1
      },
      prepareResponseData: Function,
      printAttribute: {
        type: String,
        default: 'name'
      },
      queryParam: {
        type: String,
        default: 'q'
      },
      required: Boolean,
      value: Array
    },
    mixins: [theme],
    data() {
      return {
        currentChip: '',
        inputId: this.mdInputId || 'chips-' + uniqueId(),
        selectedChips: this.value
      };
    },
    computed: {
      classes() {
        return {
          'md-static': this.mdStatic,
          'md-disabled': this.disabled
        };
      },
      hasReachedMaxSize() {
        return this.selectedChips.length === this.mdMax;
      }
    },
    methods: {
      addChip() {
        if (this.currentChip && !this.hasReachedMaxSize) {
          const value = this.currentChip.trim();

          if (this.selectedChips.indexOf(value) < 0) {
            this.selectedChips.push(value);
            this.currentChip = null;
            this.$emit('input', this.selectedChips);
            this.$emit('change', this.selectedChips);
            this.applyAutocompleteFocus();
          }
        }
      },
      applyAutocompleteFocus() {
        this.$nextTick(() => {
          this.$refs.autocomplete.$refs.input.focus();
        });
      },
      deleteChip(chip) {
        let index = this.selectedChips.indexOf(chip);

        if (index >= 0) {
          this.selectedChips.splice(index, 1);
        }

        this.$emit('change', this.selectedChips);
        this.applyInputFocus();
      },
      deleteLastChip() {
        if (!this.currentChip) {
          this.selectedChips.pop();
          this.$emit('change', this.selectedChips);
          this.applyInputFocus();
        }
      },
      onFocus() {
        if (this.parentContainer) {
          this.parentContainer.isFocused = true;
        }
      },
      onInput() {
        this.updateValues();
        // this.$emit('change', this.$refs.input.value);
        // this.$emit('input', this.$refs.input.value);
        // this.$emit('selected', this.selected, this.$refs.input.value);
      },
      onBlur() {
        this.parentContainer.isFocused = false;
        this.setParentValue();
      },
      verifyProps() {
        let errorMessage = '';

        if (!this.parentContainer) {
          errorMessage = 'You should wrap the md-input in a md-input-container';
        }

        // if (!this.listIsEmpty && !this.filterList) {
        //   errorMessage = 'You should use a `filterList` function prop with the `list` prop';
        // }

        if (!this.fetch) {
          errorMessage = 'You should use a `fetch` function prop';
        }

        if (errorMessage) {
          this.$destroy();
          throw new Error(errorMessage);
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');

        if (!this.listIsEmpty) {
          this.items = Object.assign([], this.list);
        }

        // this.query = this.value;

        // this.verifyProps();

        // this.setParentDisabled();
        // this.setParentRequired();
        // this.setParentPlaceholder();
        // this.handleMaxLength();
        // this.updateValues();
      });
    }
  };
</script>

<style lang="scss">
</style>
