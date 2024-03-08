const nav = document.getElementById("navbar");
function ScrollPosition(){
    if (window.scrollY > 40) {
        nav?.classList.remove("staticnav");
        nav?.classList.add("navbar-scrolled");
    } else {
        nav?.classList.add("staticnav");
        nav?.classList.remove("navbar-scrolled");
    }
}
window.addEventListener("scroll", () => {
    ScrollPosition();
});
document.addEventListener("DOMContentLoaded", ()=>{
    ScrollPosition();
})