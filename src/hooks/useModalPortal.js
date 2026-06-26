import { useState, useEffect } from "react";

export function useModalPortal() {
  const [modalContainer, setModalContainer] = useState(null);

  useEffect(() => {
    let container = document.getElementById("modal-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "modal-root";
      document.body.appendChild(container);
    }
    setModalContainer(container);
  }, []);

  return modalContainer;
}
