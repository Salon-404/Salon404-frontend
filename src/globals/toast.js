import Swal from "sweetalert2";
export function successToast(title, message) {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "success",
    title: title,
    text: message,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    background: "#ffffff",
    color: "#1e293b",
    iconColor: "#4f46e5",
    customClass: {
      popup: "shadow-xl border border-indigo-200 rounded-xl",
      title: "font-semibold",
    },
  });
}

export function errorToast(title, errorMessage) {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "error",
    title: title,
    text: errorMessage ?? "Ocurrió un error. Intente nuevamente más tarde.",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    background: "#fef2f2",
    color: "#991b1b",
    iconColor: "#dc2626",
    customClass: {
      popup: "shadow-xl border border-red-200 rounded-xl",
      title: "font-semibold",
    },
  });
}
