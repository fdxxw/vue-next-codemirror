import { App } from "vue";
import Codemirror from "codemirror.vue";

Codemirror.install = (app:App):void => {
  app.component(Codemirror.name, Codemirror)
}
const _Codemirror = Codemirror

export default _Codemirror
