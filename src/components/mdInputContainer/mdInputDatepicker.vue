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
      getPosition(vertical, horizontal) {
        let menuTriggerRect = this.menuTrigger.getBoundingClientRect();

        let top = vertical === 'top'
          ? menuTriggerRect.top + menuTriggerRect.height - this.menuContent.offsetHeight
          : menuTriggerRect.top;

        let left = horizontal === 'left'
          ? menuTriggerRect.left - this.menuContent.offsetWidth + menuTriggerRect.width
          : menuTriggerRect.left;

        top += parseInt(this.mdOffsetY, 10);
        left += parseInt(this.mdOffsetX, 10);

        if (this.mdAlignTrigger) {
          if (vertical === 'top') {
            top -= menuTriggerRect.height + 11;
          } else {
            top += menuTriggerRect.height + 11;
          }
        }

        return { top, left };
      },
      calculateMenuContentPos() {
        let position;

        if (!this.mdDirection) {
          position = this.getPosition('bottom', 'right');
        } else {
          position = this.getPosition.apply(this, this.mdDirection.trim().split(' '));
        }

        position = getInViewPosition(this.menuContent, position);

        this.menuContent.style.top = position.top + window.pageYOffset + 'px';
        this.menuContent.style.left = position.left + window.pageXOffset + 'px';
      },
      recalculateOnResize() {
        window.requestAnimationFrame(this.calculateMenuContentPos);
      },
      open() {
        if (document.body.contains(this.menuContent)) {
          document.body.removeChild(this.menuContent);
        }

        document.body.appendChild(this.menuContent);
        document.body.appendChild(this.backdropElement);
        window.addEventListener('resize', this.recalculateOnResize);

        this.calculateMenuContentPos();

        getComputedStyle(this.menuContent).top;
        this.menuContent.classList.add('md-active');
        this.menuContent.focus();
        this.active = true;
        this.$emit('open');
      },
      close() {
        let close = (event) => {
          if (this.menuContent && event.target === this.menuContent) {
            let activeRipple = this.menuContent.querySelector('.md-ripple.md-active');

            this.menuContent.removeEventListener(transitionEndEventName, close);
            this.menuTrigger.focus();
            this.active = false;

            if (activeRipple) {
              activeRipple.classList.remove('md-active');
            }

            document.body.removeChild(this.menuContent);
            document.body.removeChild(this.backdropElement);
            window.removeEventListener('resize', this.recalculateOnResize);
          }
        };

        this.menuContent.addEventListener(transitionEndEventName, close);
        this.menuContent.classList.remove('md-active');
        this.$emit('close');
      },
      toggle() {
        if (this.active) {
          this.close();
        } else {
          this.open();
        }
      }
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
