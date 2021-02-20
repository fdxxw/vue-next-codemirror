<template>
  <div class="vue-codemirror" :class="{ merge }">
    <div ref="mergeview" v-if="merge"></div>
    <textarea ref="textarea" :name="name" :placeholder="placeholder" v-else></textarea>
  </div>
</template>

<script lang="ts">
import _CodeMirror from "codemirror";
const CodeMirror = window.CodeMirror || _CodeMirror;
import { ref, defineComponent, Ref, onMounted, nextTick, watch, toRefs, markRaw } from "vue";
export default defineComponent({
  name: "codemirror",
  props: {
    code: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    marker: Function,
    unseenLines: Array,
    name: {
      type: String,
      default: "codemirror",
    },
    placeholder: {
      type: String,
      default: "",
    },
    merge: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    events: {
      type: Array,
      default: () => [],
    },
    globalOptions: {
      type: Object,
      default: () => ({}),
    },
    globalEvents: {
      type: Array,
      default: () => [],
    },
  },
  setup: (props, context) => {
    const {
      code,
      value,
      marker,
      unseenLines,
      name,
      placeholder,
      merge,
      options,
      events,
      globalOptions,
      globalEvents,
    } = toRefs(props);
    const textarea: Ref<any> = ref(null);
    const mergeview: Ref<any> = ref(null);

    const content: Ref<string> = ref("");
    const cminstance: Ref<any> = ref(null);
    const codemirror: Ref<any> = ref(null);

    const refresh = () => {
      nextTick(() => {
        cminstance.value.refresh();
      });
    };
    const destroy = () => {
      // garbage cleanup
      const element = cminstance.value.doc.cm.getWrapperElement();
      element && element.remove && element.remove();
    };
    const unseenLineMarkers = () => {
      if (unseenLines?.value !== undefined && marker?.value !== undefined) {
        unseenLines?.value.forEach((line) => {
          const info = cminstance.value.lineInfo(line);
          const fn: Function = marker.value as Function;
          cminstance.value.setGutterMarker(line, "breakpoints", info.gutterMarkers ? null : fn());
        });
      }
    };
    const initialize = () => {
      const cmOptions = Object.assign({}, globalOptions.value, options.value);
      if (merge.value) {
        codemirror.value = markRaw(CodeMirror.MergeView(mergeview.value, cmOptions));
        cminstance.value = codemirror.value.edit;
      } else {
        codemirror.value = markRaw(CodeMirror.fromTextArea(textarea.value, cmOptions));
        cminstance.value = codemirror.value;
        console.log(code);
        let v = code.value || value.value || content.value;
        cminstance.value.setValue(v);
      }
      cminstance.value.on("change", (cm: any) => {
        content.value = cm.getValue();
        if (context.emit) {
          context.emit("input", content.value);
        }
      });

      // 所有有效事件（驼峰命名）+ 去重
      const tmpEvents: any = {};
      const allEvents = [
        "scroll",
        "changes",
        "beforeChange",
        "cursorActivity",
        "keyHandled",
        "inputRead",
        "electricInput",
        "beforeSelectionChange",
        "viewportChange",
        "swapDoc",
        "gutterClick",
        "gutterContextMenu",
        "focus",
        "blur",
        "refresh",
        "optionChange",
        "scrollCursorIntoView",
        "update",
      ]
        .concat(events.value as string[])
        .concat(globalEvents.value as string[])
        .filter((e) => !tmpEvents[e] && (tmpEvents[e] = true))
        .forEach((event) => {
          // 循环事件，并兼容 run-time 事件命名
          cminstance.value.on(event, (...args: any[]) => {
            // console.log('当有事件触发了', event, args)
            context.emit(event, ...args);
            const lowerCaseEvent = event.replace(/([A-Z])/g, "-$1").toLowerCase();
            if (lowerCaseEvent !== event) {
              context.emit(lowerCaseEvent, ...args);
            }
          });
        });
      context.emit("ready", codemirror.value);
      unseenLineMarkers();
      // prevents funky dynamic rendering
      refresh();
    };

    const switchMerge = () => {
      // Save current values
      const history = cminstance.value.doc.history;
      const cleanGeneration = cminstance.value.doc.cleanGeneration;
      options.value.value = cminstance.value.getValue();
      destroy();
      initialize();
      // Restore values
      cminstance.value.doc.history = history;
      cminstance.value.doc.cleanGeneration = cleanGeneration;
    };
    const handerCodeChange = (newVal: string) => {
      debugger;
      const cm_value = cminstance.value.getValue();
      if (newVal !== cm_value) {
        const scrollInfo = cminstance.value.getScrollInfo();
        cminstance.value.setValue(newVal);
        content.value = newVal;
        cminstance.value.scrollTo(scrollInfo.left, scrollInfo.top);
      }
      unseenLineMarkers();
    };
    watch(options, () => {
      for (const key in options) {
        cminstance.value.setOption(key, options.value[key]);
      }
    });
    watch(merge, () => {
      switchMerge();
    });
    watch(code as Ref<string>, () => {
      handerCodeChange(code?.value as string);
    });
    watch(value as Ref<string>, () => {
      handerCodeChange(value?.value as string);
    });
    onMounted(async () => {
      initialize();
    });
    return { textarea, mergeview, content, cminstance };
  },
});
</script>

<style scoped></style>
