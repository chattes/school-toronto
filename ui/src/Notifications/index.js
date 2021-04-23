import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = ({ type, message, onClose }) => {
  if (type === "success") {
    toast.success(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      onClose,
      autoClose: 2000,
    });
  }

  if (type === "error") {
    toast.error(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      onClose,
      autoClose: 5000,
    });
  }

  if (type === "warn") {
    toast.warn(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      onClose,
      autoClose: 3000,
    });
  }
};

export default Notification;
