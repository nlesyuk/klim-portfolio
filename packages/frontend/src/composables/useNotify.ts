import Notify from "simple-notify";
import "simple-notify/dist/simple-notify.css";

export function useNotify() {
  function success(message: string) {
    new Notify({ status: "success", title: "Success", text: message, effect: "slide", autoclose: true, autotimeout: 5000, type: "filled" });
  }

  function error(message: string) {
    new Notify({ status: "error", title: "Error", text: message, effect: "slide", autoclose: true, autotimeout: 5000, type: "filled" });
  }

  return { success, error };
}
