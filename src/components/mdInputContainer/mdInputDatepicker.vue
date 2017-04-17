<template lang="html">
  <div class="md-input-datepicker"
    @focus="onFocus"
    @blur="onBlur">
      <input
        class="md-input"
        :type="type"
        :value="value"
        :disabled="disabled"
        :required="required"
        :placeholder="placeholder"
        :maxlength="maxlength"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown.up="onInput"
        @keydown.down="onInput">
  </div>
</template>

<script>
  import common from './common';
  import getClosestVueParent from '../../core/utils/getClosestVueParent';

  export default {
    mixins: [common],
    data() {
      return {
        parentContainer: null,
      };
    },
    methods: {
      setParentValue(value) {
        this.parentContainer.setValue(value || this.$refs.input.value);
      },
      setParentDisabled() {
        this.parentContainer.isDisabled = this.disabled;
      },
      setParentRequired() {
        this.parentContainer.isRequired = this.required;
      },
      setParentPlaceholder() {
        this.parentContainer.hasPlaceholder = !!this.placeholder;
      },
      setParentUpdateValue(value) {
        this.setParentValue(value);
        this.updateValues(value);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');

        if (!this.listIsEmpty) {
          this.items = Object.assign([], this.list);
        }

        this.query = this.value;

        this.verifyProps();

        this.setParentDisabled();
        this.setParentRequired();
        this.setParentPlaceholder();
        this.handleMaxLength();
        this.updateValues();
      });
    }
  }
</script>

<style lang="css">
</style>
