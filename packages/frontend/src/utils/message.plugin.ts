import Notify from "simple-notify";
import "simple-notify/dist/simple-notify.min.css";
// https://www.npmjs.com/package/simple-notify

export default {
  install(Vue, options) {
    Vue.prototype.$message = function(message) {
      const myNotify = new Notify({
        status: "success",
        title: "Success",
        text: message,
        effect: "slide",
        autoclose: true,
        autotimeout: 5000,
        type: 3
      });
    };

    Vue.prototype.$error = function(message) {
      const myNotify = new Notify({
        status: "error",
        title: "Error",
        text: message,
        effect: "slide",
        autoclose: true,
        autotimeout: 5000,
        type: 3
      });
    };
  }
};
