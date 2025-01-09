document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header");
  const body = document.querySelector(".main-body");
  if (header) {
    body.style.paddingTop = `${header.offsetHeight}px`;
  }

  const sidebar = document.getElementById("adminSidebar");
  const toggleBtn = document.getElementById("admin-sidebar-toggle");
  const closeBtn = document.getElementById("admin-sidebar-close");

  // Hiển thị sidebar
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.add("show");
    toggleBtn.classList.remove("show");
  });

  // Ẩn sidebar
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("show");
    toggleBtn.classList.add("show");
  });
});

window.addEventListener("scroll", function () {
  const button = document.getElementById("scrollToTop");
  if (window.scrollY > 300) {
    button.style.display = "block";
  } else {
    button.style.display = "none";
  }
});

document.getElementById("scrollToTop").addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
