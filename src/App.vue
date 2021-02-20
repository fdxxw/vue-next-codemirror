<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <codemirror :options="cmOptions" value="let a = 1;" style="height: 500px; width: 500px"></codemirror>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
import codemirror from "./lib/codemirror.vue";
export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
    codemirror,
  },
  setup: () => {
    const cmOptions: Ref<Object> = ref({
      tabSize: 2,
      mode: "text/javascript",
      theme: "base16-dark",
      lineNumbers: true,
      lint: true,
      autofocus: true,
      value: "aaaa",
      // more CodeMirror options...
    });
    return {
      cmOptions,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
