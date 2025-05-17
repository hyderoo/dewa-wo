import{j as e,J as r}from"./app-Bj-2ttWe.js";const s="font-cormorant font-semibold",t="font-montserrat font-normal",i=({isOpen:n,onClose:o})=>n?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center",children:[e.jsx("div",{className:"w-16 h-16 bg-pink-50 rounded-full mx-auto mb-6 flex items-center justify-center",children:e.jsx("svg",{className:"h-8 w-8 text-pink-500",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z"})})}),e.jsx("h3",{className:`${s} text-2xl font-semibold text-gray-900 mb-2`,children:"Login Diperlukan"}),e.jsx("p",{className:`${t} text-gray-600 mb-6`,children:"Untuk memesan paket atau membuat paket kustom, Anda perlu login terlebih dahulu."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 justify-center",children:[e.jsx("button",{onClick:o,className:`
                            ${t}
                            px-4 py-3 bg-gray-100 rounded-md text-gray-700
                            hover:bg-gray-200 transition-colors
                        `,children:"Kembali"}),e.jsx(r,{href:route("login",{redirect:window.location.pathname}),className:`
                            ${t}
                            px-4 py-3 bg-pink-500 rounded-md text-white
                            hover:bg-pink-600 transition-colors
                        `,children:"Masuk"}),e.jsx(r,{href:route("register",{redirect:window.location.pathname}),className:`
                            ${t}
                            px-4 py-3 border border-pink-500 rounded-md text-pink-600
                            hover:bg-pink-50 transition-colors
                        `,children:"Daftar"})]})]})}):null;export{i as default};
